angular.module('orderCloud')
    .config(BuyerCarouselConfig)
;

function BuyerCarouselConfig($stateProvider) {
    $stateProvider
        .state('buyerCarousel', {
            parent: 'buyer',
            templateUrl: 'buyerManagement/carousel/templates/buyerCarousel.html',
            controller: 'BuyerCarouselCtrl',
            controllerAs: 'buyerCarouselCtrl',
            url: '/carousel/',
            data: {
                pageTitle: 'Buyer Carousel'
            }
        });
}