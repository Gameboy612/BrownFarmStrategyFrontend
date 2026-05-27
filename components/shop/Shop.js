export default function Shop({ icon, title, children }) {
  return (
    <section className="p-1 sm:p-[6] flex flex-row shadow-panel">
      <div className="flex flex-col items-center sm:gap-4 border-b border-line pb-4 w-[6em] justify-center sm:w-[10em] mx-4">
        <img src={icon} alt="" aria-hidden="true" className="w-auto shrink-0 object-contain -translate-y-1" />
        <h3 className="text-[1rem] font-semibold tracking-[0.18em] text-[#72421A] sm:text-[1.35rem]">
          {title}
        </h3>
      </div>
      <div className="flex flex-1 pt-5 overflow-y-visible overflow-x-auto pb-2 h-full items-center">
        <div className="min-w-max">{children}</div>
      </div>
    </section>
  );
}