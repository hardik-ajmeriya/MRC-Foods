import { memo } from 'react';
import FoodCard from './FoodCard';

const FoodGrid = ({ items, cart, onAddToCart, onRemoveFromCart, onViewDetails }) => {
  return (
    <section aria-label="Food items" className="pb-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <FoodCard
            key={item.id}
            item={item}
            quantity={cart[item.id] || 0}
            onAddToCart={onAddToCart}
            onRemoveFromCart={onRemoveFromCart}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </section>
  );
};

export default memo(FoodGrid);
