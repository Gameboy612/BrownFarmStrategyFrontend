export default function ShopHeader({ title, children }) {
  return (
    <h3 className="relative mx-auto block w-full max-w-[28rem] py-2">
      <img src="/images/shared/shop_header.png" alt="" aria-hidden="true" className="h-auto w-full object-contain" />
      <span className="absolute inset-0 flex items-center justify-center px-4 text-center pt-4 text-[1.2rem] font-semibold tracking-[0.18em] text-ink sm:text-[1.4rem] md:text-[1.6rem] text-white">
        {title}
        {children}
      </span>
    </h3>
  );
}
