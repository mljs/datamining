require(["datamining/math/matrix","datamining/statistics/analysis/plsa", "datamining/statistics/matrix-tools"],function(Matrix,PLSA,MTools){
    
    module("PLSA");
    test( "Partial Least Square Analysis - simpls", function() {
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

        var y = regression.compute([7,7,13,7]);
        
        QUnit.assert.deepClose(y,[14,7,7.75], 0.00001,"y output");
        
        var intercepts = regression.intercepts;
        var expectedI = [60.717, -8.509, -4.362];
        
        QUnit.assert.deepClose(intercepts, expectedI, 0.01, "intercepts");
        
        var coefficients = regression.coefficients;
        var expectedC = [[ -1.6981, -0.0566, 0.07075 ],
                    [  1.2735,  0.2924,	0.57193 ],
                    [ -4.0000,  1.0000, 0.50000 ],
                    [ 1.1792, 	0.1226, 0.15919 ]
                ];
                
        QUnit.assert.deepClose(coefficients, expectedC, 0.01, "coefficients");
        
        var aY = regression.compute(inputs);
        for (var i = 0; i < outputs.rows; i++) {
            for (var j = 0; j < outputs.columns; j++) {
                var actualOutput = aY[i][j];
                var expectedOutput = outputs[i][j];

                var delta = Math.abs(actualOutput - expectedOutput);
                var tol = 0.21 * expectedOutput;

                ok(delta <= tol);
            }
        }
        
        var expectedX = [0.86, 0.12, 0.00, 0.86];
        var actualX = pls.predictors.factorProportions;
        QUnit.assert.deepClose(actualX, expectedX, 0.01, "factor proportions X");
        
        var expectedY = [0.67, 0.13, 0.17, 0.00];
        var actualY = pls.dependents.factorProportions;
        QUnit.assert.deepClose(actualY, expectedY, 0.01, "factor proportions Y");
        
        var weights = pls.weights;
        var actual = pls.predictors.result;
        
        var X0 = pls.source.clone(); MTools.center(X0, undefined, true);
        var Y0 = pls.output.clone(); MTools.center(Y0, undefined, true);
        
        var expected = X0.mmul(weights);
        QUnit.assert.deepClose(actual, expected, 0.01, "x scores");
    });
    
    test( "Partial Least Square Analysis - nipals 1", function() {
        
        var X = new Matrix([
            [ 2.5, 2.4 ],
            [ 0.5, 0.7 ],
            [ 2.2, 2.9 ],
            [ 1.9, 2.2 ],
            [ 3.1, 3.0 ],
            [ 2.3, 2.7 ],
            [ 2.0, 1.6 ],
            [ 1.0, 1.1 ],
            [ 1.5, 1.6 ],
            [ 1.1, 0.9 ]
        ]);

        var Y = new Matrix([
            [ 1 ],
            [ 0 ],
            [ 1 ],
            [ 0 ],
            [ 1 ],
            [ 1 ],
            [ 0 ],
            [ 0 ],
            [ 0 ],
            [ 0 ]
        ]);
        
        var target = new PLSA(X, Y, "center", "nipals");
        
        target.compute();
        
        var x1 = target.predictors.result.mmul(target.predictors.factorMatrix.transpose()).addRowVector(MTools.mean(X));
        var y1 = target.dependents.result.mmul(target.dependents.factorMatrix.transpose()).addRowVector(MTools.mean(Y));
        
        QUnit.assert.deepClose(x1, X, 0.01, "XS*XL' ~ X0");
        QUnit.assert.deepClose(y1, Y, 0.60, "XS*YL' ~ Y0");
        
        var t = target.scoresX;
        for (var i = 0; i < t.columns; i++)
            {
                for (var j = 0; j < t.columns; j++)
                {
                    if (i !== j)
                        QUnit.assert.close(t.getColumn(i).dot(t.getColumn(j)), 0, 0.01, "t"+i+"' * t"+j+" = 0");
                }
            }

        var w = target.weights;
        for (var i = 0; i < w.columns; i++)
        {
            for (var j = 0; j < w.columns; j++)
            {
                if (i !== j)
                    QUnit.assert.close(w.getColumn(i).dot(w.getColumn(j)), 0, 0.01, "w"+i+"' * w"+j+" = 0");
            }
        }
    });
    
    test( "Partial Least Square Analysis - nipals 2", function() {
        
        var x1 = new Matrix(
        [ 
            // Class 1
            [ 5.1, 3.5, 1.4, 0.2 ], [ 4.9, 3.0, 1.4, 0.2 ], [ 4.7, 3.2, 1.3, 0.2 ], [ 4.6, 3.1, 1.5, 0.2 ],
            [ 5.0, 3.6, 1.4, 0.2 ], [ 5.4, 3.9, 1.7, 0.4 ], [ 4.6, 3.4, 1.4, 0.3 ], [ 5.0, 3.4, 1.5, 0.2 ],
            [ 4.4, 2.9, 1.4, 0.2 ], [ 4.9, 3.1, 1.5, 0.1 ], [ 5.4, 3.7, 1.5, 0.2 ], [ 4.8, 3.4, 1.6, 0.2 ],
            [ 4.8, 3.0, 1.4, 0.1 ], [ 4.3, 3.0, 1.1, 0.1 ], [ 5.8, 4.0, 1.2, 0.2 ], [ 5.7, 4.4, 1.5, 0.4 ],
            [ 5.4, 3.9, 1.3, 0.4 ], [ 5.1, 3.5, 1.4, 0.3 ], [ 5.7, 3.8, 1.7, 0.3 ], [ 5.1, 3.8, 1.5, 0.3 ], 
            [ 5.4, 3.4, 1.7, 0.2 ], [ 5.1, 3.7, 1.5, 0.4 ], [ 4.6, 3.6, 1.0, 0.2 ], [ 5.1, 3.3, 1.7, 0.5 ], 
            [ 4.8, 3.4, 1.9, 0.2 ], [ 5.0, 3.0, 1.6, 0.2 ], [ 5.0, 3.4, 1.6, 0.4 ], [ 5.2, 3.5, 1.5, 0.2 ], 
            [ 5.2, 3.4, 1.4, 0.2 ], [ 4.7, 3.2, 1.6, 0.2 ], [ 4.8, 3.1, 1.6, 0.2 ], [ 5.4, 3.4, 1.5, 0.4 ], 
            [ 5.2, 4.1, 1.5, 0.1 ], [ 5.5, 4.2, 1.4, 0.2 ], [ 4.9, 3.1, 1.5, 0.2 ], [ 5.0, 3.2, 1.2, 0.2 ], 
            [ 5.5, 3.5, 1.3, 0.2 ], [ 4.9, 3.6, 1.4, 0.1 ], [ 4.4, 3.0, 1.3, 0.2 ], [ 5.1, 3.4, 1.5, 0.2 ], 
            [ 5.0, 3.5, 1.3, 0.3 ], [ 4.5, 2.3, 1.3, 0.3 ], [ 4.4, 3.2, 1.3, 0.2 ], [ 5.0, 3.5, 1.6, 0.6 ], 
            [ 5.1, 3.8, 1.9, 0.4 ], [ 4.8, 3.0, 1.4, 0.3 ], [ 5.1, 3.8, 1.6, 0.2 ], [ 4.6, 3.2, 1.4, 0.2 ], 
            [ 5.3, 3.7, 1.5, 0.2 ], [ 5.0, 3.3, 1.4, 0.2 ]
       ]);

        var x2 = new Matrix(
        [
            // Class 2
            [7.0, 3.2, 4.7, 1.4 ], [ 6.4, 3.2, 4.5, 1.5 ], [ 6.9, 3.1, 4.9, 1.5 ], [ 5.5, 2.3, 4.0, 1.3 ],
            [6.5, 2.8, 4.6, 1.5 ], [ 5.7, 2.8, 4.5, 1.3 ], [ 6.3, 3.3, 4.7, 1.6 ], [ 4.9, 2.4, 3.3, 1.0 ],
            [6.6, 2.9, 4.6, 1.3 ], [ 5.2, 2.7, 3.9, 1.4 ], [ 5.0, 2.0, 3.5, 1.0 ], [ 5.9, 3.0, 4.2, 1.5 ],
            [6.0, 2.2, 4.0, 1.0 ], [ 6.1, 2.9, 4.7 ,1.4 ], [ 5.6, 2.9, 3.9, 1.3 ], [ 6.7, 3.1, 4.4, 1.4 ],
            [5.6, 3.0, 4.5, 1.5 ], [ 5.8, 2.7, 4.1, 1.0 ], [ 6.2, 2.2, 4.5, 1.5 ], [ 5.6, 2.5, 3.9, 1.1 ],
            [5.9, 3.2, 4.8, 1.8 ], [ 6.1, 2.8, 4.0, 1.3 ], [ 6.3, 2.5, 4.9, 1.5 ], [ 6.1, 2.8, 4.7, 1.2 ],
            [6.4, 2.9, 4.3, 1.3 ], [ 6.6, 3.0, 4.4, 1.4 ], [ 6.8, 2.8, 4.8, 1.4 ], [ 6.7, 3.0, 5.0, 1.7 ],
            [6.0, 2.9, 4.5, 1.5 ], [ 5.7, 2.6, 3.5, 1.0 ], [ 5.5, 2.4, 3.8, 1.1 ], [ 5.5, 2.4, 3.7, 1.0 ],
            [5.8, 2.7, 3.9, 1.2 ], [ 6.0, 2.7, 5.1, 1.6 ], [ 5.4, 3.0, 4.5, 1.5 ], [ 6.0, 3.4, 4.5, 1.6 ],
            [6.7, 3.1, 4.7, 1.5 ], [ 6.3, 2.3, 4.4, 1.3 ], [ 5.6, 3.0, 4.1, 1.3 ], [ 5.5, 2.5, 5.0, 1.3 ],
            [5.5, 2.6, 4.4, 1.2 ], [ 6.1, 3.0, 4.6, 1.4 ], [ 5.8, 2.6, 4.0, 1.2 ], [ 5.0, 2.3, 3.3, 1.0 ],
            [5.6, 2.7, 4.2, 1.3 ], [ 5.7, 3.0, 4.2, 1.2 ], [ 5.7, 2.9, 4.2, 1.3 ], [ 6.2, 2.9, 4.3, 1.3 ],
            [5.1, 2.5, 3.0, 1.1 ], [ 5.7, 2.8, 4.1, 1.3 ]
        ]);

        var x3 = new Matrix(
        [
            // Class 3
            [ 6.3, 3.3, 6.0, 2.5], [ 5.8, 2.7, 5.1, 1.9 ], [ 7.1, 3.0, 5.9, 2.1 ], [ 6.3, 2.9, 5.6, 1.8 ],
            [ 6.5, 3.0, 5.8, 2.2], [ 7.6, 3.0, 6.6, 2.1 ], [ 4.9, 2.5, 4.5, 1.7 ], [ 7.3, 2.9, 6.3, 1.8 ], 
            [ 6.7, 2.5, 5.8, 1.8], [ 7.2, 3.6, 6.1, 2.5 ], [ 6.5, 3.2, 5.1, 2.0 ], [ 6.4, 2.7, 5.3, 1.9 ],
            [ 6.8, 3.0, 5.5, 2.1], [ 5.7, 2.5, 5.0, 2.0 ], [ 5.8, 2.8, 5.1, 2.4 ], [ 6.4, 3.2, 5.3, 2.3 ],
            [ 6.5, 3.0, 5.5, 1.8], [ 7.7, 3.8, 6.7, 2.2 ], [ 7.7, 2.6, 6.9, 2.3 ], [ 6.0, 2.2, 5.0, 1.5 ],
            [ 6.9, 3.2, 5.7, 2.3], [ 5.6, 2.8, 4.9, 2.0 ], [ 7.7, 2.8, 6.7, 2.0 ], [ 6.3, 2.7, 4.9, 1.8 ],
            [ 6.7, 3.3, 5.7, 2.1], [ 7.2, 3.2, 6.0, 1.8 ], [ 6.2, 2.8, 4.8, 1.8 ], [ 6.1, 3.0, 4.9, 1.8 ],
            [ 6.4, 2.8, 5.6, 2.1], [ 7.2, 3.0, 5.8, 1.6 ], [ 7.4, 2.8, 6.1, 1.9 ], [ 7.9, 3.8, 6.4, 2.0 ],
            [ 6.4, 2.8, 5.6, 2.2], [ 6.3, 2.8, 5.1, 1.5 ], [ 6.1, 2.6, 5.6, 1.4 ], [ 7.7, 3.0, 6.1, 2.3 ],
            [ 6.3 ,3.4, 5.6, 2.4], [ 6.4, 3.1, 5.5, 1.8 ], [ 6.0, 3.0, 4.8, 1.8 ], [ 6.9, 3.1, 5.4, 2.1 ],
            [ 6.7, 3.1, 5.6, 2.4], [ 6.9, 3.1, 5.1, 2.3 ], [ 5.8, 2.7, 5.1, 1.9 ], [ 6.8, 3.2, 5.9, 2.3 ],
            [ 6.7, 3.3, 5.7, 2.5], [ 6.7, 3.0, 5.2, 2.3 ], [ 6.3, 2.5, 5.0, 1.9 ], [ 6.5, 3.0, 5.2, 2.0 ],
            [ 6.2, 3.4, 5.4, 2.3], [ 5.9, 3.0, 5.1, 1.8 ]
        ]);
        
        var idxTrain = Matrix.indices(0, 25);
        var idxTest = Matrix.indices(25, 50);
        
        var inputs = Matrix.stack(
            x1.subMatrixRow(idxTrain),
            x2.subMatrixRow(idxTrain),
            x3.subMatrixRow(idxTrain)
        );

        var outputs = Matrix.expand([[1,0,0],[0,1,0],[0,0,1]],[25,25,25]);
        
        var target = new PLSA(inputs, outputs, "standardize", "nipals");
        target.compute();
        
        var xmean = target.predictors.means;
        var xstdd = target.predictors.standardDeviations;
        
        var t = target.predictors.result;
        var p = target.predictors.factorMatrix;
        var tp = t.mmul(p.transpose());
        tp.apply(function(i,j){
            tp[i][j] = tp[i][j] * xstdd[j] + xmean[j];
        });
        QUnit.assert.deepClose(tp, inputs, 0.01, "Test X");

        // Test Y
        var ymean = target.dependents.means;
        var ystdd = target.dependents.standardDeviations;
        var u = target.dependents.result;
        var q = target.dependents.factorMatrix;
        var uq = u.mmul(q.transpose());
        uq.apply(function(i, j){
            uq[i][j] = uq[i][j] * ystdd[j] + ymean[j];
        });
        QUnit.assert.deepClose(uq, outputs, 0.45, "Test Y");
        
        var test = Matrix.stack(
            x1.subMatrixRow(idxTest),
            x2.subMatrixRow(idxTest),
            x3.subMatrixRow(idxTest)
        );

        var regression = target.createRegression();
        var Y = new Matrix(regression.compute(test));
        
        var maxIdx = Y.rowMaxsIndex();
        equal(maxIdx[0].column, 0);
        equal(maxIdx[11].column, 0);
        equal(maxIdx[29].column, 1);
        equal(maxIdx[30].column, 1);
        equal(maxIdx[52].column, 2);
        equal(maxIdx[70].column, 2);
        
        var target2 = new PLSA(inputs, outputs, "standardize", "simpls");
        target2.compute();
        
        QUnit.assert.deepClose(target.predictors.result.getColumn(0).abs(),target2.predictors.result.getColumn(0).abs(), 0.00001, "First columns should be equal");
        QUnit.assert.deepClose(target.predictors.factorMatrix.getColumn(0).abs(),target2.predictors.factorMatrix.getColumn(0).abs(), 0.00001, "First columns should be equal");
        
        QUnit.assert.deepClose(target.predictors.result.getColumn(1).abs(),target2.predictors.result.getColumn(1).abs(), 0.001, "Others are approximations");
        QUnit.assert.deepClose(target.predictors.factorMatrix.getColumn(1).abs(),target2.predictors.factorMatrix.getColumn(1).abs(), 0.01, "Others are approximations");

        QUnit.assert.deepClose(target.predictors.factorProportions.slice(0,2),target2.predictors.factorProportions.slice(0,2), 0.05, "Explained variance proportion should be similar");
        QUnit.assert.deepClose(target.predictors.factorProportions,target2.predictors.factorProportions, 0.8, "Explained variance proportion should be similar");
    });
    
    test( "Partial Least Square Analysis - nipals 3", function() {
        var x = new Matrix(
        [
            [ 4,   9,  6,  7,  7,  8,  3,  2 ],
            [ 6,  15, 10, 15, 17, 22,  9,  4 ],
            [ 8,  21, 14, 23, 27, 36, 15,  6 ],
            [ 10, 21, 14, 13, 11, 10,  3,  4 ],
            [ 12, 27, 18, 21, 21, 24,  9,  6 ],
            [ 14, 33, 22, 29, 31, 38, 15,  8 ],
            [ 16, 33, 22, 19, 15, 12,  3,  6 ],
            [ 18, 39, 26, 27, 25, 26,  9,  8 ],
            [ 20, 45, 30, 35, 35, 40, 15, 10 ]
        ]);

        var y = new Matrix(
        [
            [ 1, 1 ],
            [ 3, 1 ],
            [ 5, 1 ],
            [ 1, 3 ],
            [ 3, 3 ],
            [ 5, 3 ],
            [ 1, 5 ],
            [ 3, 5 ],
            [ 5, 5 ]
        ]);
        
        var pls = new PLSA(x, y, "center", "nipals").compute();
        
        var eYL = new Matrix([[0.808248528018965, -0.588841504103759],[0.588841504103759,  0.808248528018964]]);
        var eYS = new Matrix([
            [ -2.79418006424545,   -0.438814047830411 ],
            [ -1.17768300820752,   -1.61649705603793  ],
            [  0.438814047830411,  -2.79418006424545  ],
            [ -1.61649705603793,	1.17768300820752  ],
            [  0.00000000000000,	0.00000000000     ],
            [  1.61649705603793,   -1.17768300820752  ],
            [ -0.438814047830411,	2.79418006424545  ],
            [  1.17768300820752,    1.61649705603793  ],
            [  2.79418006424545,    0.438814047830411 ]
        ]);
        
        var eProportionsX = [ 0.82623088878551032, 0.17376911121448976, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00 ];
        var eProportionsY = [ 0.50000000000000033, 0.50000000000000011, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00 ];
        
        var aXL = pls.predictors.factorMatrix;
        var aYL = pls.dependents.factorMatrix;
        var aXS = pls.predictors.result;
        var aYS = pls.dependents.result;
        var aW = pls.weights;
        
        var regression = pls.createRegression();
        var aB = regression.coefficients;
        var aC = regression.intercepts;
        
        QUnit.assert.deepClose(eProportionsX, pls.predictors.factorProportions, 0.01);
        QUnit.assert.deepClose(eProportionsY, pls.dependents.factorProportions, 0.01);

        for (var i = 0; i < eYL.rows; i++)
            for (var j = 0; j < eYL.columns; j++) {
                QUnit.assert.close(aYL[i][j], eYL[i][j], 0.01);
            }

        for (var i = 0; i < eYS.rows; i++)
            for (var j = 0; j < eYS.columns; j++)
                QUnit.assert.close(aYS[i][j], eYS[i][j], 0.01);
    });
    
    test( "Partial Least Square Analysis - Variable importance", function() {
        
        var X = new Matrix([
            [ 2.5, 2.4 ],
            [ 0.5, 0.7 ],
            [ 2.2, 2.9 ],
            [ 1.9, 2.2 ],
            [ 3.1, 3.0 ],
            [ 2.3, 2.7 ],
            [ 2.0, 1.6 ],
            [ 1.0, 1.1 ],
            [ 1.5, 1.6 ],
            [ 1.1, 0.9 ]
        ]);
        
        var Y = new Matrix([[1],[0],[1],[0],[1],[1],[0],[0],[0],[0]]);
            
        var pls = new PLSA(X, Y, "center", "nipals");
        pls.compute(1);
        
        var actual1 = pls.importance;
        var actual1v = pls.factors[0].variableImportance;
        var expected1v = [0.9570761, 1.041156];

        QUnit.assert.deepClose(actual1v, expected1v, 0.0001);
        
        pls.compute(2);
        
        var actual2v1 = pls.factors[0].variableImportance;
        var expected2v1 = [0.9570761, 1.041156];
        QUnit.assert.deepClose(actual2v1, expected2v1, 0.0001);
        
        var actual2v2 = pls.factors[1].variableImportance;
        var expected2v2 = [1.0187709, 0.980870];
        QUnit.assert.deepClose(actual2v2, expected2v2, 0.0001);
        
        var actual2 = pls.importance;
        var expected2 = [[0.9570761,1.0187709],[1.041156,0.980870]];
        QUnit.assert.deepClose(actual2, expected2, 0.0001);
        
    });
    
    test( "Partial Least Square Analysis - Throw test", function() {
        
        var X = new Matrix(
        [
            [ 2.5, 2.4, 0 ],
            [ 0.5, 0.7, 0 ],
            [ 2.2, 2.9, 0 ],
            [ 1.9, 2.2, 0 ],
            [ 3.1, 3.0, 0 ],
            [ 2.3, 2.7, 0 ],
            [ 2.0, 1.6, 0 ],
            [ 1.0, 1.1, 0 ],
            [ 1.5, 1.6, 0 ],
            [ 1.1, 0.9, 0 ]
        ]);

        var Y = new Matrix([[1],[0],[1],[0],[1],[1],[0],[0],[0],[0]]);
        
        var pls = new PLSA(X, Y, "standardize", "nipals");
        
        throws(function(){pls.compute();},/^Standard deviation cannot be zero/,"If there is a constant variable, an exception must be thrown.");
        
    });
    
});