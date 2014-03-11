require(["datamining/math/matrix","datamining/statistics/analysis/plsa"],function(Matrix,PLSA){

    var inputs = new Matrix([
        [7,7,13,7],
        [4,3,14,7],
        [10,5,12,5],
        [16,7,11,3],
        [13,3,10,3]
    ]);
    var outputs = new Matrix([
        [14,7,8],
        [10,7,6],
        [8,5,5],
        [2,4,7],
        [6,2,4]
    ]);

    var pls = new PLSA(inputs, outputs, "center", "simpls");
    pls.compute();

    var regression = pls.createRegression();
    console.log(pls)

    var w = pls.weights;
    console.log(w.rows, w.columns);
    var toLog = "";
    for(var i = 0; i < w.rows; i++)
        for(var j = 0 ; j < w.columns; j++)
            toLog += w[i][j] + " ";
    console.log(toLog);

    var y = regression.compute([7,7,13,7]);
    console.log("y - Theory : [14,7,7.75] , Practice : "+ y);

    var intercepts = regression.intercepts;
    console.log("intercepts - Theory : [60.717,-8.509,-4.362] , Practice : "+ intercepts);

});