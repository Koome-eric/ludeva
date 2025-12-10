const SectionTitle = ({
  title,
  paragraph,
  width = "520px",
  center = false,
  mb = "60px",
}: {
  title: string;
  paragraph: string;
  width?: string;
  center?: boolean;
  mb?: string;
}) => {
  return (
    <div
      className={`w-full ${center ? "mx-auto text-center" : ""}`}
      style={{ maxWidth: width, marginBottom: mb }}
    >
      <h2 className="mb-3 text-2xl font-semibold leading-snug text-black dark:text-white sm:text-3xl md:text-[32px]">
        {title}
      </h2>

      <p className="text-sm md:text-base leading-relaxed text-body-color dark:text-gray-300">
        {paragraph}
      </p>
    </div>
  );
};

export default SectionTitle;
