var mapModel= function (model) {
    // Initialize here

    schema = [];
    for (var i=0;i<model.length;i++){
                
        schema.push(
        {
            id : model[i].id,
            model : model[i].model,
            title : model[i].title,
            authorName : model[i].authorName
        });
    }

    return schema;
};

module.exports = mapModel;
