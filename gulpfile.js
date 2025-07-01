//modulos instalados
const gulp = require('gulp');
const rename = require('gulp-rename');
const cryptoJs = require('crypto-js');
const through2 = require('through2');
const del = require('del');

//environment
const ENVIRONMENT = require('./gulp-environment.json');

//node
const path = require('path');
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

function encryptContent(content) {
    return cryptoJs.AES
        .encrypt(content, ENVIRONMENT.SECRET_KEY)
        .toString();
}

let backupFailStatus = null;

function backupFiles() {
    try {
        green('Iniciando backup dos arquivos encriptados . . .')
        if (ENVIRONMENT.ACTIVE_BACKUP_FILES_BACKUP) {
            return gulp.src(`${ENVIRONMENT.ENCRYPTED_FOLDER}/**/*.*`)
                .pipe(gulp.dest(ENVIRONMENT.BACKUP_FOLDER))
        } else {
            yellow("Backup de arquivos encriptados não está ativo!!")
        }
    } catch(error) {
        red('Falha no backup de arquivos!');
        backupFail = 'error: ' + error;
    }
}

async function deleteOldEncryptedFiles() {
    if (backupFailStatus == null) {
        green('Finalizado backup dos arquivos!');
        green("Apagando antigos arquivos encriptados . . .");
        await del.deleteAsync([`${ENVIRONMENT.ENCRYPTED_FOLDER}/**/*`])
            .then(() => green('Arquivos apagados com sucesso !'))
            .catch((error) => {
                red('Falha ao apagar arquivos encryptados');
                red('error: ', error);
            });
        return;
    }
    red('Não foi possível apagar arquivos encriptados!')
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
        .map((pathToFile) => path.join(ENVIRONMENT.PROJECT_FOLDER_ROOT, pathToFile).replaceAll("\\", "/"));
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
gulp.task('backupFiles', backupFiles);
gulp.task('deleteOldEncryptedFiles', deleteOldEncryptedFiles);
gulp.task('encryptFiles', encryptFiles);
gulp.task('decrypt', decryptFiles);
gulp.task('encrypt', gulp.series('backupFiles', 'deleteOldEncryptedFiles', 'encryptFiles'));
