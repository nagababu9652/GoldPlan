import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';

export const metadata = {
  title: 'Mutual Funds - FinPlan India',
  description: 'Learn about mutual funds with FinPlan India.',
};

export default function MutualFundsPage() {
  return (
    <main className="min-h-screen bg-bone text-obsidian">
      <Navigation />
      <div className="page-frame grain">
        <section className="px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-12 gap-6 lg:gap-10 mb-16">
            <div className="col-span-12 lg:col-span-8">
              <div className="label-mono text-ash mb-4">&mdash; 019 &middot; Investments</div>
              <h1 className="display text-[44px] lg:text-[64px]">Mutual Funds</h1>
              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6] mt-6 max-w-2xl">
                Expert guidance on mutual funds for Indian families.
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
