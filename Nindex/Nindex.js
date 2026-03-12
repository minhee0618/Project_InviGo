document.addEventListener("DOMContentLoaded", () => {
  

    document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".process-card");

    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animated");
            observer.unobserve(entry.target); // 한 번만 애니메이션 실행
          }
        });
      },
      {
        threshold: 0.3, // 30% 보이면 실행
      }
    );

    cards.forEach((card) => observer.observe(card));
  });
  /* FAQ */
  window.toggleFAQ = function (element) {
    element.classList.toggle("active");
    const answer = element.nextElementSibling;
    answer.style.display = (answer.style.display === "block") ? "none" : "block";
  };

  /* Review 슬라이드 */
  let currentReviewIndex = 0;
  const reviewCards = document.querySelectorAll(".review-card");
  const reviewsPerPage = 3;

  function updateReviewVisibility() {
    reviewCards.forEach((card, index) => {
      card.style.display = (index >= currentReviewIndex && index < currentReviewIndex + reviewsPerPage) ? "block" : "none";
    });
  }

  window.prevReview = function () {
    if (currentReviewIndex > 0) {
      currentReviewIndex--;
      updateReviewVisibility();
    }
  };

  window.nextReview = function () {
    if (currentReviewIndex + reviewsPerPage < reviewCards.length) {
      currentReviewIndex++;
      updateReviewVisibility();
    }
  };

  updateReviewVisibility(); // 초기 렌더링

  /* 리뷰 폼 */
  window.openReviewForm = function () {
    const form = document.querySelector(".review-form");
    form.style.display = "block";
    form.style.opacity = "1";
  };

  window.closeReviewForm = function () {
    const form = document.querySelector(".review-form");
    form.style.opacity = "0";
    setTimeout(() => {
      form.style.display = "none";
    }, 300);
  };

  /* AboutUs 카드 뒤집기 */
  window.flipCard = function (element) {
    element.classList.toggle("flipped");
  };
});