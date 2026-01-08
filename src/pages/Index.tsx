import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { TrendingSection } from '@/components/home/TrendingSection';
import { PopularSection } from '@/components/home/PopularSection';
import { ContinueWatchingSection } from '@/components/home/ContinueWatchingSection';
import { NewsSection } from '@/components/home/NewsSection';
import { QuoteSection } from '@/components/home/QuoteSection';

const Index = () => {
  return (
    <Layout showRain>
      <HeroSection />
      <ContinueWatchingSection />
      <TrendingSection />
      <QuoteSection />
      <PopularSection />
      <NewsSection />
    </Layout>
  );
};

export default Index;
