requirejs.config({
    baseUrl: "scripts/"
});

require([
    "datamining/clustering/hclust","datamining/math/distance"
],function(HClust,Distance){
    var data = [[1,2,3],[3,9,7],[6,2,4]];
    var infos = [{name:"a"},{name:"b"},{name:"c"}];
    var result = HClust.compute(data,HClust.methods.singleLinkage,Distance.squareEuclidean);
    console.log(result);
    console.log(getTree(result,infos));
    
    function getTree (cluster, infos) {
        var tree = {children: [], distance:cluster.distance};
        if(cluster.children.length===0) {
            var info = infos[[cluster.elements[0].index]];
            for(var prop in info) {
                tree[prop] = info[prop];
            }
            return tree;
        } else {
            for(var i = 0, ii = cluster.children.length; i < ii; i++) {
                tree.children[i] = getTree(cluster.children[i], infos);
            }
        }
        return tree;
    };
});
