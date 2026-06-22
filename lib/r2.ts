import crypto from "crypto";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getR2Config() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;
  const region = process.env.R2_REGION ?? "auto";

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
    throw new Error("Konfigurasi R2 belum lengkap.");
  }

  return { endpoint, accessKeyId, secretAccessKey, bucket, publicBaseUrl, region };
}

function hashHex(input: crypto.BinaryLike) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function hmac(key: crypto.BinaryLike | crypto.KeyObject, input: string) {
  return crypto.createHmac("sha256", key).update(input).digest();
}

function getSigningKey(secretAccessKey: string, date: string, region: string) {
  const dateKey = hmac(`AWS4${secretAccessKey}`, date);
  const regionKey = hmac(dateKey, region);
  const serviceKey = hmac(regionKey, "s3");
  return hmac(serviceKey, "aws4_request");
}

function toAmzDate(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

function toDateStamp(date: Date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function encodePath(value: string) {
  return value
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function extensionFromType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

function safeName(name: string) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50) || "image";
}

async function putObjectToR2({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer;
  contentType: string;
}) {
  const config = getR2Config();
  const endpointUrl = new URL(config.endpoint);
  const host = endpointUrl.host;
  const now = new Date();
  const amzDate = toAmzDate(now);
  const dateStamp = toDateStamp(now);
  const payloadHash = hashHex(body);
  const canonicalUri = `/${config.bucket}/${encodePath(key)}`;
  const url = `${endpointUrl.origin}${canonicalUri}`;

  const canonicalHeaders = [
    `content-type:${contentType}`,
    `host:${host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
  ].join("\n") + "\n";
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hashHex(canonicalRequest),
  ].join("\n");
  const signingKey = getSigningKey(config.secretAccessKey, dateStamp, config.region);
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const requestBody = new Blob([new Uint8Array(body)], { type: contentType });
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: authorization,
      "Content-Type": contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    },
    body: requestBody,
  });

  if (!response.ok) {
    throw new Error(`Upload R2 gagal: ${response.status} ${await response.text()}`);
  }
}

async function deleteObjectFromR2(objectKey: string) {
  const config = getR2Config();
  const endpointUrl = new URL(config.endpoint);
  const host = endpointUrl.host;
  const now = new Date();
  const amzDate = toAmzDate(now);
  const dateStamp = toDateStamp(now);
  const emptyHash = hashHex(Buffer.alloc(0));
  const canonicalUri = `/${config.bucket}/${encodePath(objectKey)}`;
  const url = `${endpointUrl.origin}${canonicalUri}`;

  const canonicalHeaders = [
    `host:${host}`,
    `x-amz-content-sha256:${emptyHash}`,
    `x-amz-date:${amzDate}`,
  ].join("\n") + "\n";
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = ["DELETE", canonicalUri, "", canonicalHeaders, signedHeaders, emptyHash].join("\n");
  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, hashHex(canonicalRequest)].join("\n");
  const signingKey = getSigningKey(config.secretAccessKey, dateStamp, config.region);
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: authorization,
      "x-amz-content-sha256": emptyHash,
      "x-amz-date": amzDate,
    },
  });
}

export async function deleteListingImage(objectKey: string) {
  await deleteObjectFromR2(objectKey);
}

export async function deleteUserAvatar(objectKey: string) {
  await deleteObjectFromR2(objectKey);
}

async function uploadImage(file: File, keyPrefix: string) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Format foto harus JPG, PNG, atau WEBP.");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Ukuran foto maksimal 5MB.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const body = Buffer.from(arrayBuffer);
  const extension = extensionFromType(file.type);
  const key = `${keyPrefix}/${Date.now()}-${crypto.randomUUID()}-${safeName(file.name)}.${extension}`;

  await putObjectToR2({ key, body, contentType: file.type });

  return {
    objectKey: key,
    imageUrl: `${getR2Config().publicBaseUrl.replace(/\/$/, "")}/${key}`,
  };
}

export async function uploadListingImage(file: File, userId: string) {
  return uploadImage(file, `listings/${userId}`);
}

export async function uploadUserAvatar(file: File, userId: string) {
  return uploadImage(file, `users/${userId}/avatar`);
}
