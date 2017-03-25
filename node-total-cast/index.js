var express = require('express');
var app = express();
var router = express.Router();
var fs = require('fs');
var readline = require('readline');
var GoogleAPI = require('googleapis');
var GoogleAuth = require('google-auth-library');
var AWS = require('aws-sdk');

// storing creds
var SCOPES = ['https://www.googleapis.com/auth/drive'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'total_cast_tokens.json';

// initialising aws-sdk
AWS.config.loadFromPath('./config.json');
AWS.config.update({
   signatureVersion: 'v4'
});
var s3 = new AWS.S3({apiVersion: '2006-03-01'});

var service = GoogleAPI.drive('v3');

// function to delete the temporarily downloaded file
function deleteFile(filePath) {
    fs.unlink(filePath, function(error) {
        if (error) {
            console.log("Error deleting file" + error);
            return;
        } else {
            console.log("Deleted file successfully");
        }
    })
}

// helper function to upload files onto s3
function uploadFileToS3Helper(path, fileName) {

    fs.readFile(path, function(error, data) {
        if (error) {
            console.log(error + "Failed to read file");
        } else {
            var upploadParams = {
                Bucket: "total-cast",
                Key: "ninja/"+fileName,
                Body: data
            };

            s3.upload(upploadParams, function(error, data) {
                if(error) {
                    console.log("Error while uploading to s3 " + error);
                } else {
                    console.log(data);
                    console.log("deleting the local file");
                    deleteFile(path);
                }
            });
        }
    });
}

// function to list all buckets in s3
function uploadFileToS3(path, fileName) {
    // check if the object is present, if not upload it 
    var listObjectParams = {
        Bucket: "total-cast",
        Prefix: "ninja"
    };
    s3.listObjects(listObjectParams, function(error, data) {
        if (error) {
            console.log("Error while searching s3" + error);
        } else {
            if (data.Contents.length != 0) {
                // looping through to check if the video is already present on s3
                var isPresent = false;
                for (var i=0; i<data.Contents.length; i++) {
                    if (data.Contents[i].Key === "ninja/"+fileName) {
                        console.log("Video " + data.Contents[i].Key + " already present on S3");
                        isPresent = true;
                        break;
                    } 
                }
                
                // if not present then upload the file
                if (!isPresent) {
                    uploadFileToS3Helper(path, fileName);
                } else {
                    // delete the downloaded file
                    // bug -> should have checked s3 first and then downloaded
                    // will do someday :P
                    deleteFile(path);
                } 

            } else {
                // since there's no content, uploading files
                uploadFileToS3Helper(path, fileName);
            }
        }
    });
}

// function to download the specfified file 
function downloadFile(fileId, fileName, auth) {
    var filePipe = fs.createWriteStream("./temp/" + fileName)
                    .on('finish', function() {
                        console.log("Saved to disk");
                        console.log("Uploading to S3");
                        uploadFileToS3('./temp/'+fileName, fileName);
                    })
                    .on('error', function(err) {
                        console.log("Error saving file to disk" + err);
                    });

            service.files.get({
                auth: auth,
                fileId: fileId,
                alt: 'media'
            })
            .on('end', function() {
                console.log('Done');
            })
            .on('error', function(error) {
                console.log("Error during download");
            })
            .pipe(filePipe);
}

// function to list all files in the drive after successful auth
function listFiles(auth) {
    service.files.list({
        auth: auth,
        pageSize: 10,
        fields: "nextPageToken, files(id, name, mimeType, size)"
    }, function(error,  response) {
        if (error) {
            console.log("The API returned an error " + error);
            return;
        }
        var files = response.files;
        if (files.length == 0) {
            console.log("No files found");
        } else {
            console.log("Files ===>");
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                console.log(file);

                // download if the mime type is mp4
                if (file.mimeType == "video/mp4") {
                    downloadFile(file.id, file.name, auth);
                }
            }
        }
    });
}

// function to store the obtained token
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log("Token stored to " + TOKEN_PATH);
}

// function to create a new token and store it 
function createNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log("Authorize this app by visiting the url " + authUrl);

    // creating a readline interface for entering oauth token 
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question("Enter the code from that page here", function(code) {
        rl.close();
        oauth2Client.getToken(code, function(error, token) {
            if (error) {
                console.log("Error while retrieving access token " + error);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

// function to authorize the client
function authorizeClient(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new GoogleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // check if token is already present, if yes reuse the same one else get a new one
    fs.readFile(TOKEN_PATH, function(error, token) {
        if (error) {
            createNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

// reading client secret
fs.readFile('client_secret.json', function(error, content) {
    if (error) {
        console.log('Error  reading creds ' + error);
        return
    } 
    // authorize a client with loaded credentials and call drive api
    authorizeClient(JSON.parse(content), listFiles);
});
