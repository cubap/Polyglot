// SETUP

var express    = require('express');
var bodyParser = require('body-parser');

var newVector     = require('./newVector');
var newTranslate    = require('./newTranslation');
var newTranscription    = require('./newTranscription');

var websiteAddress = "http://localhost:8080";

var vectorURL = websiteAddress.concat("/api/vectors/");
var transcriptionURL = websiteAddress.concat("/api/transcriptions/");
var translationURL = websiteAddress.concat("/api/translations/");

//ROUTE FUNCTIONS

exports.findAll = function(req, res) {
    newTranscription.find(function(err, transcriptions) {
        if (err)
            res.send(err);

        res.json(transcriptions);
    });

};

exports.deleteAll = function(req, res) {
      
    newTranscription.find(function(err, transcriptions) {
        if (err) {res.send(err)};

        transcriptions.forEach(function(transcription){
            newTranscription.remove({_id: transcription._id},
            function(err){
                if (err) {res.send(err)};
            })
        });

        res.send("all gone");
    }); 
};

exports.addNew = function(req, res) {
    
    var transcription = new newTranscription(); 

    var newTransID = transcription.id;
    var transURL = transcriptionURL.concat(newTransID);
    console.dir(req.body);

    transcription.body.push({
        "text": req.body.body.text,
        "id": transURL,
        "format": req.body.body.format
    });

    transcription.target.push(
        {"id": req.body.target.id,
        "format": req.body.target.format}
    );

    transcription.save(function(err) {
        if (err)
            res.send(err);
    });

    res.json({ "url": transURL });

};

exports.getByID = function(req, res) {
    newTranscription.findById(req.params.transcription_id, function(err, transcription) {
        if (err)
            res.send(err);
        res.json(transcription);
        
    });

};

exports.updateOne = function(req, res) {

    var updateDoc = newTranscription.findById(req.params.transcription_id);
    updateDoc.exec(function(err, transcription) {

        if (err) {res.send(err)};

        transcription.body.text = req.body.body.text;

        transcription.save(function(err) {
            if (err) {res.send(err)};
            res.json(transcription);
        });
    });

};


exports.deleteOne = function(req, res) {
        newTranscription.remove({
            _id: req.params.transcription_id
        }, 
        function(err, transcription) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
};

//fix these functions

exports.getByVectorTarget = function(req, res) {
    vectorSelected = req.params.vector_target;
    newTranscription.findOne(
        {'target': {'id': vectorSelected}},
        function(err, transcription) {
            if (err)
                res.send(err);
            res.json(transcription);           
        }
    );

};

exports.getByTextTarget = function(req, res) {
    textSelected = req.params.text_target;
    newTranslation.findOne(
        {'target': {'id': textSelected}},
        function(err, transcription) {
            if (err)
                res.send(err);
            res.json(transcription);
        }
    );
};

