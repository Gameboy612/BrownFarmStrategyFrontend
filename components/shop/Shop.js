import ShopHeader from './ShopHeader';

export default function Shop({ icon, title, children }) {
  return (
    <section className="p-6 shadow-panel">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <ShopHeader>
            <div className='flex flex-direction-row items-center gap-2 w-100%'>
              <img src={icon} alt="" aria-hidden="true" className="h-[3em] w-[3em] object-contain -translate-y-1" /><span className="px-2 pr-5">{title}</span>
            </div>
          </ShopHeader>
        </div>
      </div>
      <div className="pt-5 overflow-y-visible overflow-x-auto pb-2">
        <div className="min-w-max">{children}</div>
      </div>
    </section>
  );
}