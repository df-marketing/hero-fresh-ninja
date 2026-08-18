import { AppExperience } from "@/app/components/app-experience";
import { getActiveCoupons } from "@/lib/data/coupons";

export default async function Home() {
  const coupons = await getActiveCoupons();
  return <main><AppExperience coupons={coupons} /></main>;
}
