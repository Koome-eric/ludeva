import Container from "@/components/ui/Container";

interface PageHeroProps {
  title: string;
  description?: string;
  imageSrc?: string;
}

export default function PageHero({
  title,
  description,
  imageSrc = "/images/hero3.jpg",
}: PageHeroProps) {
  return (
    <section className="relative min-h-[75vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${imageSrc}')`,
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <Container className="relative z-10 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline mb-4">
          {title}
        </h1>
        {description && (
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </Container>
    </section>
  );
}