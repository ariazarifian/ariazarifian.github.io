document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll('.card');

  const handleScroll = () => {
    const triggerHeight = window.innerHeight / 1.3;

    cards.forEach((card, index) => {
      const cardTop = card.getBoundingClientRect().top;

      if (cardTop < triggerHeight) {
        setTimeout(() => {
          card.classList.add('show');
        }, index * 200);
      } else {
        card.classList.remove('show');
      }
    });
  };

  window.addEventListener('scroll', handleScroll);
});