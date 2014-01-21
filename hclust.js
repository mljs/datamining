requirejs.config({
    baseUrl: "scripts/"
});

require([
    "datamining/clustering/hclust","datamining/math/distance"
],function(HClust,Distance){
    var data = [[1,2,3],[3,9,7],[6,2,4]];
    var result = HClust.compute(data,HClust.methods.singleLinkage,Distance.squareEuclidean);
    console.log(result);
    console.log(result.getTree());
});
