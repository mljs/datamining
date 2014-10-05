define(["../../scripts/datamining/math/matrix","datamining/math/decompositions"],function(Matrix,DC){
    
    module("Decompositions");
    
    test("SVD - inverse", function(){
        
        var value = new Matrix([[1,1],[2,2]]);
        var target = new DC.SingularValueDecomposition(value);
        var expected = new Matrix([[0.1,0.2],[0.1,0.2]]);
        
        var actual = target.solve(Matrix.eye(2));
        QUnit.assert.deepClose(actual, expected, 0.001);
        
        actual = target.inverse();
        QUnit.assert.deepClose(actual, expected, 0.001);
        
    });
    
    test("SVD - constructor 1", function(){
        
        var value = new Matrix([[1,2],[3,4],[5,6],[7,8]]).transpose();
        var target = new DC.SingularValueDecomposition(value, {
            computeLeftSingularVectors: true,
            computeRightSingularVectors: true,
            autoTranspose: false
        });
        
        var actual = target.leftSingularVectors.mmul(Matrix.diag(target.diagonal)).mmul(target.rightSingularVectors.transpose());
        QUnit.assert.deepClose(actual, value, 0.01, "less rows than column, no autotranspose");
        
        var U = [[-0.641423027995072, -0.767187395072177],[-0.767187395072177, 0.641423027995072]];
        QUnit.assert.deepClose(target.leftSingularVectors, U, 0.01, "Left singular vectors");
        
        var V = [ [ -0.152483233310201,  0.822647472225661  ],
                [ -0.349918371807964,  0.421375287684580  ],
                [ -0.547353510305727,  0.0201031031435023 ],
                [ -0.744788648803490, -0.381169081397574  ]];

        QUnit.assert.deepClose(target.rightSingularVectors.subMatrix(0,3,0,1), V, 0.0001, "Right singular vectors");
        
        var S = [[14.2690954992615, 0],[0,0.626828232417543]];
        QUnit.assert.deepClose(Matrix.diag(target.diagonal.slice(0,2)), S, 0.001, "Diagonal");
    });
    
    test("SVD - constructor 2", function(){
        
        var value = new Matrix([[1,2],[3,4],[5,6],[7,8]]);
        var target = new DC.SingularValueDecomposition(value, {
            computeLeftSingularVectors: true,
            computeRightSingularVectors: true,
            autoTranspose: false
        });
        
        var actual = target.leftSingularVectors.mmul(Matrix.diag(target.diagonal)).mmul(target.rightSingularVectors.transpose());
        QUnit.assert.deepClose(actual, value, 0.01, "more rows than columns");
        
        var V = [[0.641423027995072, -0.767187395072177],[0.767187395072177, 0.641423027995072]];
        QUnit.assert.deepClose(target.rightSingularVectors, V, 0.0001, "Right singular vectors");
        
        var U = [ [ 0.152483233310201,  0.822647472225661  ],
                [ 0.349918371807964,  0.421375287684580  ],
                [ 0.547353510305727,  0.0201031031435023 ],
                [ 0.744788648803490, -0.381169081397574  ]];

        QUnit.assert.deepClose(target.leftSingularVectors.subMatrix(0,3,0,1), U, 0.001, "Left singular vectors");
        
        var S = [[14.2690954992615, 0],[0,0.626828232417543]];
        QUnit.assert.deepClose(Matrix.diag(target.diagonal.slice(0,2)), S, 0.001, "Diagonal");
        
    });
    
    test("SVD - constructor 3", function(){
        
        var value = new Matrix([[1,2],[3,4],[5,6],[7,8]]).transpose();
        var target = new DC.SingularValueDecomposition(value, {
            computeLeftSingularVectors: true,
            computeRightSingularVectors: true,
            autoTranspose: true
        });
        
        var actual = target.leftSingularVectors.mmul(Matrix.diag(target.diagonal)).mmul(target.rightSingularVectors.transpose());
        QUnit.assert.deepClose(actual, value, 0.01, "less rows than column, with autotranspose");
        
        var U = [[0.641423027995072, -0.767187395072177],[0.767187395072177, 0.641423027995072]];
        QUnit.assert.deepClose(target.leftSingularVectors, U, 0.01, "Left singular vectors");
        
        var V = [ [ 0.152483233310201,  0.822647472225661  ],
                [ 0.349918371807964,  0.421375287684580  ],
                [ 0.547353510305727,  0.0201031031435023 ],
                [ 0.744788648803490, -0.381169081397574  ]];

        QUnit.assert.deepClose(target.rightSingularVectors.subMatrix(0,3,0,1), V, 0.0001, "Right singular vectors");
        
        var S = [[14.2690954992615, 0],[0,0.626828232417543]];
        QUnit.assert.deepClose(Matrix.diag(target.diagonal.slice(0,2)), S, 0.001, "Diagonal");
        
    });
    
    test("SVD - constructor 4", function(){

        var value = new Matrix([[1,2],[3,4],[5,6],[7,8]]).transpose();
        var target = new DC.SingularValueDecomposition(value, {
            computeLeftSingularVectors: true,
            computeRightSingularVectors: false,
            autoTranspose: true
        });

        ok(true, "less rows than column, with autotranspose, not computing right singular vectors");

        var U = [[0.641423027995072, -0.767187395072177],[0.767187395072177, 0.641423027995072]];
        QUnit.assert.deepClose(target.leftSingularVectors, U, 0.001, "Left singular vectors");

        var V = [ [ 0, 0 ], [ 0,  0  ],[ 0,  0 ],[ 0, 0 ]];

        deepEqual(target.rightSingularVectors, V, "Right singular vectors (0)");

        var S = [[14.2690954992615, 0],[0,0.626828232417543]];
        QUnit.assert.deepClose(Matrix.diag(target.diagonal.slice(0,2)), S, 0.001, "Diagonal");
        
    });
    
    test("SVD - constructor 5", function(){

        var value = new Matrix([[1,2],[3,4],[5,6],[7,8]]).transpose();
        var target = new DC.SingularValueDecomposition(value, {
            computeLeftSingularVectors: false,
            computeRightSingularVectors: true,
            autoTranspose: true
        });

        ok(true, "less rows than column, with autotranspose, not computing left singular vectors");

        var U = [[0, 0],[0, 0]];
        deepEqual(target.leftSingularVectors, U, "Left singular vectors (0)");

        var V = [ [ 0.152483233310201,  0.822647472225661  ],
                [ 0.349918371807964,  0.421375287684580  ],
                [ 0.547353510305727,  0.0201031031435023 ],
                [ 0.744788648803490, -0.381169081397574  ]];

        QUnit.assert.deepClose(target.rightSingularVectors.subMatrix(0,3,0,1), V, 0.0001, "Right singular vectors");

        var S = [[14.2690954992615, 0],[0,0.626828232417543]];
        QUnit.assert.deepClose(Matrix.diag(target.diagonal.slice(0,2)), S, 0.001, "Diagonal");
        
    });
    
    test("SVD - autotranspose", function(){

        var value1 = new Matrix([[ 2.5,  2.4 ],[ 0.5,  0.7 ],[ 2.2,  2.9 ],[ 1.9,  2.2 ],[ 3.1,  3.0 ],[ 2.3,  2.7 ],[ 2.0,  1.6 ],[ 1.0,  1.1 ],[ 1.5,  1.6 ],[ 1.1,  0.9 ]]);
        var value2 = value1.transpose();

        var target1 = new DC.SingularValueDecomposition(value1, {autoTranspose:true});
        var target2 = new DC.SingularValueDecomposition(value2, {autoTranspose:true});

        deepEqual(target1.leftSingularVectors,target2.rightSingularVectors,"RSV");
        deepEqual(target1.rightSingularVectors,target2.leftSingularVectors,"LSV");
        deepEqual(target1.diagonalMatrix,target2.diagonalMatrix,"Diag");
        
    });
    
    test("SVD - solve", function(){
        
        var count = 100;
        var value = Matrix.empty(count, 3);
        var output = new Array(count);

        for (var i = 0; i < count; i++)
        {
            var x = i + 1;
            var y = 2 * (i + 1) - 1;
            value[i][0] = x;
            value[i][1] = y;
            value[i][2] = 1;
            output[i] = 4 * x - y + 3;
        }

        var target = new DC.SingularValueDecomposition(value);

        var expected = value;
        var actual = target.leftSingularVectors.mmul(
            Matrix.diag(target.diagonal)).mmul(target.rightSingularVectors.transpose());

        QUnit.assert.deepClose(actual, expected, 1e-8, "Checking the decomposition");

        var solution = target.solve(Matrix.columnVector(output));

        expected= output;
        actual = value.mmul(solution).to1DArray();

        QUnit.assert.deepClose(actual, expected, 1e-8, "Solution");
        
    });
    
});