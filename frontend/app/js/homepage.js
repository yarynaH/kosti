function initHomepageSlider() {
  $(".homepage_slider").slick({
    dots: true,
    arrows: false,
    autoplaySpeed: 3000,
    autoplay: true
  });
  $(window).load(function () {
    if (
      $(".blog-list").length > 0 &&
      $(".blog-list").data().loadMore === true
    ) {
      $(".blog-list").data("loadMore", false);
      loadMoreArticles();
    }
  });
}
$(document).ready(function () {
  initHomepageSlider();
});
