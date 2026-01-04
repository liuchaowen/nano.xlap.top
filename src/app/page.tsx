import Header from '@/components/Header';
import ImageGenerator from '@/components/ImageGenerator';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <ImageGenerator />
      </main>
      <Footer />
    </div>
  );
}
