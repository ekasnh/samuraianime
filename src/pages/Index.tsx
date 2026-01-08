import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { TrendingSection } from '@/components/home/TrendingSection';
import { PopularSection } from '@/components/home/PopularSection';
import { ContinueWatchingSection } from '@/components/home/ContinueWatchingSection';

const Index = () => {
  return (
    <Layout showRain>
      <HeroSection />
      <ContinueWatchingSection />
      <TrendingSection />
      <PopularSection />
    </Layout>
  );
};

export default Index;
