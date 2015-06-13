var mapModel= function (model) {
    // Initialize here

    newModel = [];
    for (var i=0;i<model.length;i++){
                
        newModel.push(
        {
            id : model[i].id,
            model : model[i].model,
            title : model[i].title,
            authorName : model[i].authorName
        });
    }

	console.log("return newModel");
    console.log(newModel);

    return newModel;
};

module.exports = mapModel;


