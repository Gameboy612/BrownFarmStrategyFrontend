export default function Shop({ icon, title, children }) {
  return (
    <section className="p-6 shadow-panel">
      <div className="flex items-center gap-4 border-b border-line pb-4">
        <img src={icon} alt="" aria-hidden="true" className="h-[3em] w-[3em] shrink-0 object-contain -translate-y-1" />
        <h3 className="min-w-0 text-[1.2rem] font-semibold tracking-[0.18em] text-[#72421A] sm:text-[1.35rem]">
          {title}
        </h3>
      </div>
      <div className="pt-5 overflow-y-visible overflow-x-auto pb-2">
        <div className="min-w-max">{children}</div>
      </div>
    </section>
  );
}