define(["../math/distance"],function(Distance){
	
	var SOM = function(){
		this._distance = Distance.euclidean;
	};
	
	SOM.prototype = {
		setDistance: function(distance) {
			this._distance = distance;
		}
	};
	
	return SOM;
	
});