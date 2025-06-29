//modulos instalados
const gulp = require('gulp');
const rename = require('gulp-rename');
const cryptoJs = require('crypto-js');
const through2 = require('through2');

//node
const path = require('path');
const fs = require('fs');
const { Buffer } = require('safe-buffer');

function red(text) {
    console.log(`\t\x1b[31m${text}\x1b[0m`);
}

function green(text) {
    console.log(`\t\x1b[32m${text}\x1b[0m`);
}

function yellow(text) {
    console.log(`\t\x1b[33m${text}\x1b[0m`);
}

const ENVIRONMENT = {
    //senha para desencriptação
    SECRET_KEY: 'bosta',
    //caminho da raiz do projeto
    PROJECT_FOLDER_ROOT: './test_project',
    //caminho da pasta encriptada
    ENCRYPTED_FOLDER: 'encrypted',
    //caminho da pasta desencriptada
    DECRYPTED_FOLDER: 'decrypted',
    /**
     * caminho para os arquivos que devem ser ignorados, esse caminho começa
     * na raiz do projeto
     * Ex:
     * test_project
     *  |
     *  | -> raiz do projeto
     *  |
     *  | -> /node_modules
     *  |    |
     *  |     -> ...
     *  | -> /src
     *  |    |
     *  |     -> index.js
     *  |
     *    -> package-lock.json
     */
    FILE_NAMES_TO_IGNORE: [
        'package-lock.json',
        'node_modules/**/*.*',
    ]
};

function encryptContent(content) {
    return cryptoJs.AES
        .encrypt(content, ENVIRONMENT.SECRET_KEY)
        .toString();
}

function decryptContent() {
    return gulp.src(`${ENVIRONMENT.ENCRYPTED_FOLDER}/**/*.enc`)
        .pipe(through2.obj((file, enc, cb) => {
            const decrypted = cryptoJs.AES
                .decrypt(file.contents.toString(), ENVIRONMENT.SECRET_KEY)
                .toString(cryptoJs.enc.Utf8);
            file.contents = Buffer.from(decrypted);
            cb(null, file);
        }))
        .pipe(rename({ extname: '' }))
        .pipe(gulp.dest(ENVIRONMENT.DECRYPTED_FOLDER));
}

function encryptFiles() {
    green('Iniciando encriptação . . .');
    //obtendo o caminho raíz e somando
    // invertendo a barra de \ para /, duas barras '\\' para representar apenas uma barra '\'
    const fullPathsToIgnore = ENVIRONMENT.FILE_NAMES_TO_IGNORE
        .map((pathToFile) => path.join(ENVIRONMENT.PROJECT_FOLDER_ROOT, pathToFile).replaceAll("\\", "/"))
    //encriptando os arquivos da lista
    return gulp.src(`${ENVIRONMENT.PROJECT_FOLDER_ROOT}/**/*.*`, { ignore: fullPathsToIgnore })
        .pipe(through2.obj((file, enc, callback) => {
            if (file.isBuffer()) {
                try {
                    const content = file.contents.toString('utf8');
                    const encryptedContent = encryptContent(content);
                    file.contents = Buffer.from(encryptedContent, 'utf8');
                    file.path = file.path + '.enc';
                } catch(err) {
                    red("Erro ao encriptar o arquivo: ", file.path);
                }
            }
            callback(null, file);
        }))
        .pipe(gulp.dest(ENVIRONMENT.ENCRYPTED_FOLDER));
}

function decryptContent(enctryptedContent) {
    return cryptoJs.AES.decrypt(enctryptedContent, ENVIRONMENT.SECRET_KEY)
        .toString(cryptoJs.enc.Utf8);
}

function decryptFiles() {
    green('Iniciando desencriptação . . .');
    return gulp.src(`${ENVIRONMENT.ENCRYPTED_FOLDER}/**/*.*`)
        .pipe(through2.obj((file, enc, callback) => {
            if (file.isBuffer()) {
                try {
                    const encryptedContent = file.contents.toString('utf8');
                    const decryptedContent = decryptContent(encryptedContent);
                    file.contents = Buffer.from(decryptedContent, 'utf8');
                    file.path = file.path.replace('.enc', '');
                } catch(err) {
                    red("Erro ao desencriptar o arquivo: ", file.path);
                    red("Verifique se a senha ou se os arquivos de encriptação são válidos!");
                }
            }
            callback(null, file);
        }))
        .pipe(gulp.dest(ENVIRONMENT.DECRYPTED_FOLDER));
}

gulp.task('decrypt', decryptFiles);
gulp.task('encrypt', encryptFiles);

// chamar uma lista de tarefas em apenas 1 comando
// gulp.task('encrypt', gulp.series('encryptSRCFiles', 'encryptFilesByNames'));
