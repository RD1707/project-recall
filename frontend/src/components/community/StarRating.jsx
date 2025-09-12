import React, { useState } from 'react';

const StarRating = ({ rating, ratingCount, onRate }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleRate = (rate) => {
    if (onRate) {
      onRate(rate);
    }
  };

  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="star-rating-wrapper">
      <div 
        className={`star-rating ${onRate ? 'interactive' : ''}`}
        onMouseLeave={() => setHoverRating(0)}
      >
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;
          const isHovered = starValue <= hoverRating;
          const isSelected = starValue <= rating;
          
          return (
            <span
              key={starValue}
              className={`star ${isHovered ? 'hover' : ''}`}
              onMouseEnter={() => onRate && setHoverRating(starValue)}
              onClick={() => handleRate(starValue)}
            >
              {onRate ? (
                <i className={isHovered ? "fas fa-star" : "far fa-star"}></i>
              ) : (
                <>
                  {starValue <= fullStars ? <i className="fas fa-star"></i> : 
                   (starValue === fullStars + 1 && halfStar) ? <i className="fas fa-star-half-alt"></i> : 
                   <i className="far fa-star"></i>}
                </>
              )}
            </span>
          );
        })}
      </div>
      {ratingCount !== undefined && (
        <span className="rating-count">
          ({ratingCount})
        </span>
      )}
    </div>
  );
};

export default StarRating;