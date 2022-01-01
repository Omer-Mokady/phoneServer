const express = require('express');
const db = require('../db/dbOperations');
const crypto = require('crypto');
const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        let results = await db.getAllPhones();
        res.status(200).json(results);
    } catch(err) {
        res.sendStatus(500);
    }
});

router.get('/:serial', async (req, res, next) => {
    try {
        let results = await db.getBySerial(req.params.serial);
        if(results!='') {
            res.status(200).json(results);
        } else {
            res.status(404).json({'error' : '404 - The certain serial does not exist in db.'})
        }
    } catch(err) {
        res.sendStatus(500);
    }
});

router.delete('/:serial', async (req, res, next) => {
    try {
        await db.deletePhone(req.params.serial);
        res.sendStatus(200);
    } catch(err) {
        res.sendStatus(500);
    }
});

router.post('/', async (req, res, next) => {
    try {
        if(req.body.metadata!==undefined) {
            req.body.metadata = crypto.createHash('sha256')
            .update(JSON.stringify(req.body.metadata)).digest('hex');
        }
        await db.createPhone(req.body);
        res.sendStatus(201);
    } catch(err) {
        if(err.code == 'ER_BAD_NULL_ERROR') {
            res.status(400).json({'error' : '400 - Server could not find the serial property in the json request.'})
        } else if(err.code == 'ER_DUP_ENTRY') {
            res.status(400).json({'error' : '400 - The serial property is already exists in the db.'})
        } else {
            res.sendStatus(500);
        }
    }
});

router.patch('/:serial', async (req, res, next) => {
    try {
        if(req.body.metadata!==undefined) {
            req.body.metadata = crypto.createHash('sha256')
            .update(JSON.stringify(req.body.metadata)).digest('hex');
        }
        let results = await db.updatePhone(req.body, req.params.serial);
        if(results.affectedRows==0) {
            res.status(404).json({'error' : '404 - The certain serial does not exist in db.'})
        } else {
            res.sendStatus(201);
        }
    } catch(err) {
        if(err.code == 'ER_BAD_FIELD_ERROR') {
            res.status(400).json({'error' : '400 - json request including incorrect property key.'})
        } else {
            res.sendStatus(500);
        }
    }
});

module.exports = router;