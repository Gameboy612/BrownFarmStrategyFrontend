"use client";

import { PageFrame, SectionTitle } from '../../components/PageFrame';
import { useLocale } from '../../components/IntlProvider.client';
import Shop from '../../components/shop/Shop';
import ShopSlot from '../../components/shop/ShopSlot';
import shopsData from '../../data/game/shops.json';
import productsData from '../../data/game/products.json';

const productMap = Object.fromEntries(productsData.items.map((product) => [product.id, product]));

function toProductId(recipeId) {
  return recipeId.replace(/^products\//, '');
}

function formatShopProducts(shop) {
  return shop.recipes
    .map((recipe) => productMap[toProductId(recipe.id)])
    .filter(Boolean);
}

export default function ProductsPage() {
  const { t, locale } = useLocale();
  const localeName = locale === 'zh-Hant' ? 'zh-Hant' : locale;
  const shops = shopsData.map((shop) => ({
    ...shop,
    products: formatShopProducts(shop),
  }));

  return (
    <PageFrame
      currentPath="/products"
      eyebrow={t('nav.products')}
      title={t('features.products.title')}
      description={t('features.products.description')}
    >
      <div className="space-y-6">
        <section className="border border-line bg-[rgba(244,240,231,0.9)] p-6 shadow-panel">
          <SectionTitle
            eyebrow={t('products.intro.eyebrow')}
            title={t('products.intro.title')}
            // description={t('products.intro.description')}
          />
        </section>

        <div className="">
          {shops.map((shop) => (
            <Shop key={shop.id} title={shop.names[localeName]} icon={shop.imageUrl}>
              <div className="flex items-center h-full gap-2 sm:gap-4">
                {shop.products.map((product) => {
                  // find recipe for this product to get productionTime
                  const recipe = shop.recipes.find((r) => r.id === `products/${product.id}`);
                  const productionTime = recipe?.stats?.productionTime ?? null;

                  return (
                    <div key={product.id} className="w-[6rem] shrink-0 sm:w-[8rem] md:w-[12rem]">
                      <ShopSlot
                        href={`/products/${product.id}`}
                        icon={product.imageUrl}
                        title={product.names[localeName]}
                        subtitle={shop.names[localeName]}
                        productionTime={productionTime}
                        tooltipEnabled={true}
                      />
                    </div>
                  );
                })}
              </div>
            </Shop>
          ))}
        </div>
      </div>
    </PageFrame>
  );
}