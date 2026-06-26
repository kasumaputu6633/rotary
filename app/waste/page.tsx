import WasteMapClient from "./_components/WasteMapClient";
import { getWasteLocations } from "./actions";

// This is a Server Component. It fetches data on the server side
// before rendering the client component, providing instant load times and SEO.
export default async function WasteMapPage() {
  const dbLocations = await getWasteLocations();

  return <WasteMapClient initialLocations={dbLocations} />;
}
