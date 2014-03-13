require(["datamining/statistics/array-tools", "datamining/statistics/matrix-tools", "datamining/math/matrix"],function(ATools, MTools ,Matrix) {
    
    module("Statistical tools");
    
    var values = [-5, 0.2, 2];
    var matrix = new Matrix([[2, -1, 5],[7, 0.5, 9]]);
    
    test( "Standard deviation", function() {
        var expected = 3.6350149013908224;
        var actual = ATools.standardDeviation(values);
        
        equal(actual, expected, "stdev of array");
        
        var means = MTools.mean(matrix);
        deepEqual(means, [4.5, -0.25, 7], "matrix means");
        
        var stdev = MTools.standardDeviation(matrix, means);
        deepEqual(stdev, [3.5355339059327378, 1.0606601717798212, 2.8284271247461903], "matrix stdev");
        
        var stdev2 = MTools.standardDeviation(matrix);
        deepEqual(stdev, stdev2, "1-step matrix stdev is equal to 2-step");
    });

    test( "Mean", function() {
    
        var expected = -0.93333333333333324;
        var actual = ATools.mean(values);
        equal(actual, expected, "mean of array");
        
        var rowMean = MTools.mean(matrix, 0);
        deepEqual(rowMean, [4.5, -0.25, 7], "matrix row means");
        
        var colMean = MTools.mean(matrix, 1);
        deepEqual(colMean, [2, 5.5], "matrix column means");
        
        var totalMean = MTools.mean(matrix, -1);
        equal(totalMean, 3.75, "matrix total mean");
    });
    
    test( "Median", function() {
    
        var values, expected, actual;

        values = [ -5, 0.2, 2, 5, -0.7 ];
        expected = 0.2;
        actual = ATools.median(values, false);
        equal(actual, expected, "Median of array - Odd");

        values = [ -5, 0.2, 2, 5 ];
        expected = 1.1;
        actual = ATools.median(values, false);
        equal(actual, expected, "Median of array - Even");
        
        var matrix = new Matrix([[2,-1,5],[7,1.7,9],[-4,2.5,6],[0.2,0.5,-2]]);
        var mean = MTools.mean(matrix);
        deepEqual(mean, [1.3000, 0.9250, 4.5000], "Matrix means");
        var median = MTools.median(matrix);
        deepEqual(median, [1.1000, 1.1000, 5.5000], "Matrix medians");
        
        matrix = matrix.transpose();
        mean = MTools.mean(matrix);
        QUnit.assert.deepClose(mean, [2, 5.9, 1.5, -0.43333333333333335], 0.00001,"Matrix transpose means");
        var median = MTools.median(matrix);
        deepEqual(median, [2.0000, 7.0000, 2.5000, 0.2000], "Matrix medians");
        
    });
    
    test( "Mode", function() {
        var values = [3,3,1,4];
        var expected = 3;
        var actual = ATools.mode(values);
        equal(actual, expected, "Mode of array");
        
        var matrix = [[3,3,1,4],[0,1,1,1],[0,1,2,4]];
        var expected = [0,1,1,4];
        var actual = MTools.mode(matrix);
        deepEqual(actual, expected, "Mode of matrix");
    });
    
    test( "Covariance", function() {
        var matrix = new Matrix([[4,2,0.6],[4.2,2.1,0.59],[3.9,2.0,0.58],[4.3,2.1,0.62],[4.1,2.2,0.63]]);
        var expected = [[0.025,0.0075,0.00175],[0.0075,0.007,0.00135],[0.00175,0.00135,0.00043]];
        var actual = MTools.covariance(matrix);
        QUnit.assert.deepClose(actual, expected, 0.00001,"Covariance of matrix");
        
        var matrix2 = matrix.transpose();
        actual = MTools.covariance(matrix2, 1);
        QUnit.assert.deepClose(actual, expected, 0.00001, "Covariance of transpose matrix");
        
        var weights = [0.2,0.2,0.2,0.2,0.2];
        var expected = [[0.025,0.0075,0.00175],[0.0075,0.007,0.00135],[0.00175,0.00135,0.00043]];
        actual = MTools.weightedCovariance(matrix, weights, undefined, 0);
        QUnit.assert.deepClose(actual, expected, 0.00001,"Weighted covariance of matrix");
        
        actual = MTools.weightedCovariance(matrix2, weights, undefined, 1);
        QUnit.assert.deepClose(actual, expected, 0.00001, "Weighted covariance of transpose matrix");
        
    });
    
});