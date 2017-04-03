angular.module('orderCloud')
    .controller('UserGroupProductsCtrl', UserGroupProductsController)
;

function UserGroupProductsController($q, $exceptionHandler, $state, $stateParams, $uibModal, toastr, OrderCloud, sdkOrderCloud, ocParameters, ocProducts, ocProductPricing, SelectedBuyer, SelectedUserGroup, ProductList, Parameters, MappedProductList, BuyerProductAssignments, UserGroupProductAssignments) {
    var vm = this;
    vm.list = MappedProductList;
    //Set parameters
    vm.parameters = Parameters;
    //Sort by is a filter on mobile devices
    vm.sortSelection = Parameters.sortBy ? (Parameters.sortBy.indexOf('!') === 0 ? Parameters.sortBy.split('!')[1] : Parameters.sortBy) : null;
    //Check if search was used
    vm.searchResults = Parameters.search && Parameters.search.length > 0;

    vm.clearSearch = clearSearch; //Clear the search parameter, reload the state & reset the page
    vm.filter = filter; //Reload the state with new parameters
    vm.loadMore = loadMore; //Load the next page of results with all of the same parameters
    vm.pageChanged = pageChanged; //Reload the state with the incremented page parameter
    vm.search = search; //Reload the state with new search parameter & reset the page
    vm.updateSort = updateSort; //Conditionally set, reverse, remove the sortBy parameter & reload the state
    var CurrentAssignments = BuyerProductAssignments.concat(UserGroupProductAssignments);

    function filter(resetPage) {
        $state.go('.', ocParameters.Create(vm.parameters, resetPage));
    }

    function search() {
        vm.filter(true);
    }

    function clearSearch() {
        vm.parameters.search = null;
        vm.filter(true);
    }

    function updateSort(value) {
        value ? angular.noop() : value = vm.sortSelection;
        switch (vm.parameters.sortBy) {
            case value:
                vm.parameters.sortBy = '!' + value;
                break;
            case '!' + value:
                vm.parameters.sortBy = null;
                break;
            default:
                vm.parameters.sortBy = value;
        }
        vm.filter(false);
    }

    function pageChanged() {
        $state.go('.', {
            page: vm.list.Meta.Page
        });
    }

    function loadMore() {
        var parameters = angular.extend(Parameters, {page:vm.list.Meta.Page + 1, filters:{Active:undefined}});
        return sdkOrderCloud.Products.List(parameters)
            .then(function (data) {
                vm.list.Items = vm.list.Items.concat(data.Items);
                vm.list.Meta = data.Meta;
            });
    }

    vm.createProduct = function () {
        ocProducts.Create()
            .then(function (newProduct) {
                toastr.success(newProduct.Name + ' was created.');
                $state.go('productDetail', {
                    productid: newProduct.ID
                });
            });
    };

    vm.updateProductPrice = function(scope) {
        ocProductPricing.UpdateProductPrice(scope.product, SelectedBuyer, BuyerProductAssignments.concat(UserGroupProductAssignments), SelectedUserGroup)
            .then(function(data) {
                CurrentAssignments = data.UpdatedAssignments;
                scope.product.SelectedPrice = data.SelectedPrice;
            })
            .catch(function(ex) {
                if (ex === 'CREATE') {
                    ocProductPricing.CreateProductPrice(scope.product, SelectedBuyer, BuyerProductAssignments.concat(UserGroupProductAssignments), SelectedUserGroup)
                        .then(function(data) {
                            CurrentAssignments = data.UpdatedAssignments;
                            scope.product.SelectedPrice = data.SelectedPrice;
                        })
                        .catch(function(ex) {
                            $exceptionHandler(ex);
                        });
                } else {
                    $exceptionHandler(ex);
                }
            });
    };
}