requirejs.config({
    baseUrl: "scripts/"
});

require([
    "tests/statistics/tools",
    "tests/statistics/models/regression/simple-linear-regression",
    "tests/statistics/models/regression/multiple-linear-regression",
    "tests/statistics/models/regression/multivariate-linear-regression",
    "tests/statistics/analysis/plsa",
    "tests/math/decompositions"
]);