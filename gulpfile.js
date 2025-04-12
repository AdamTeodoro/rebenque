//new
const gulp = require('gulp');
const rename = require('gulp-rename');
const cryptoJs = require('crypto-js');

//node
const fs = require('fs');
const through2 = require('through2');
const { Buffer } = require('safe-buffer');

//environment
const SECRETKEY = 'your secret pass';
const SRCFOLDER = 'src';
const ENCRYPTEDFOLDER = 'SRC_ENCRYPTED';
const SRCDECRYPTED = 'SRC_DECRYPTED';

function encryptContent(content) {
    return cryptoJs.AES.encrypt(content, SECRETKEY).toString();
}

function decryptContent() {
    return gulp.src(`${ENCRYPTEDFOLDER}/**/*.enc`)
        .pipe(through2.obj((file, enc, cb) => {
            const decrypted = cryptoJs.AES
                .decrypt(file.contents.toString(), SECRETKEY)
                .toString(cryptoJs.enc.Utf8);
            file.contents = Buffer.from(decrypted);
            cb(null, file);
        }))
        .pipe(rename({ extname: '' }))
        .pipe(gulp.dest(SRCDECRYPTED));
}

function encryptFiles() {
    return gulp.src(`${SRCFOLDER}/**/*.*`)
        .pipe(through2.obj((file, enc, callback) => {
            if (file.isBuffer()) {
                try {
                    const content = file.contents.toString('utf8');
                    const encryptedContent = encryptContent(content);
                    file.contents = Buffer.from(encryptedContent, 'utf8');
                    file.path = file.path + '.enc';
                } catch(err) {
                    console.log("Error on encrypt file: ", file.path, "Error: ", err);
                }
            }
            callback(null, file);
        }))
        .pipe(gulp.dest(ENCRYPTEDFOLDER));
}

function decryptContent(enctryptedContent) {
    return cryptoJs.AES.decrypt(enctryptedContent, SECRETKEY)
        .toString(cryptoJs.enc.Utf8);
}

function decryptFiles() {
    return gulp.src(`${ENCRYPTEDFOLDER}/**/*.*`)
        .pipe(through2.obj((file, enc, callback) => {
            if (file.isBuffer()) {
                try {
                    const encryptedContent = file.contents.toString('utf8');
                    const decryptedContent = decryptContent(encryptedContent);
                    file.contents = Buffer.from(decryptedContent, 'utf8');
                    file.path = file.path.replace('.enc', '');
                } catch(err) {
                    console.log("Error on decrypt file: ", file.path, "Error: ", err);
                }
            }
            callback(null, file);
        }))
        .pipe(gulp.dest(SRCDECRYPTED));
}

gulp.task('encrypt', encryptFiles);
gulp.task('decrypt', decryptFiles);
gulp.task('default', gulp.series('encrypt'));
