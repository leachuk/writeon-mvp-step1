var mapModel= function (model) {
    // Initialize here

    schema = [];
    for (var i=0;i<model.length;i++){
                
        schema.push(
        {
            id : model[i].id,
            location : model[i].location,
            authorName : model[i].authorName
        });
    }

    return schema;
};

module.exports = mapModel;
