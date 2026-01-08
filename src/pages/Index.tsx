import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { TrendingSection } from '@/components/home/TrendingSection';
import { PopularSection } from '@/components/home/PopularSection';
import { ContinueWatchingSection } from '@/components/home/ContinueWatchingSection';
import { ContinueReadingSection } from '@/components/home/ContinueReadingSection';
import { NewsSection } from '@/components/home/NewsSection';
import { QuoteSection } from '@/components/home/QuoteSection';

const Index = () => {
  return (
    <Layout showRain={false}>
      <HeroSection />
      <ContinueWatchingSection />
      <ContinueReadingSection />
      <TrendingSection />
      <QuoteSection />
      <PopularSection />
      <NewsSection />
    </Layout>
  );
};

export default Index;
