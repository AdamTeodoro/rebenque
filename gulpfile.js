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

async function cleanBkp() {
    try {
        green("Apagando pasta de backup");
        console.log('pathToBkpFolder: ', pathToBkpFolder);
        await del.deleteAsync([path.join(`${ENVIRONMENT.BACKUP_FOLDER}`, '/**/*')])
            .then(() => green("Pasta de backup apagada com sucesso"))
            .catch((error) => red("Falha ao apagar pasta de backup \n error: ", error));
    } catch(error) {
        red("Falha ao apagar pasta de backup \n error: ", error)
    }
}

let backupFailStatus = null;
function backupFiles() {
    try {
        green('Iniciando backup dos arquivos encriptados . . .')
        const folderDistFromNewBackup = path.join(`${ENVIRONMENT.BACKUP_FOLDER}`, Date.now().toString()).replaceAll('\\', '/');
        console.log('folderDistFromNewBackup: ', folderDistFromNewBackup);
        if (ENVIRONMENT.ACTIVE_BACKUP_FILES_BACKUP) {
            return gulp.src(`${ENVIRONMENT.ENCRYPTED_FOLDER}/**/*.*`)
                .pipe(gulp.dest(folderDistFromNewBackup));
        } else {
            yellow("Backup de arquivos encriptados não está ativo!!")
        }
    } catch(error) {
        red('Falha no backup de arquivos!');
        backupFailStatus = 'error: ' + error;
    }
}

async function deleteOldEncryptedFiles() {
    try {
        if (backupFailStatus == null) {
            green('Finalizado backup dos arquivos!');
            green("Apagando antigos arquivos encriptados . . .");
            const pathToOldEncryptedFiles = path.join(`${ENVIRONMENT.ENCRYPTED_FOLDER}`, '/**/*');
            //Cuidado, os leitões barrigudos comedores de hamburguer últra processado, esqueceram de retornar erro quando o path estiver voltando e a 
            // barra virada para a direita Ex: ../../sopa/sopademorango/
            //O path.join -> retorna um path virado para o lado esquerdo no windows e direito no linux
            //A biblioteca del aceita tando a barra invertida, quanto a barra correta
            await del.deleteAsync([pathToOldEncryptedFiles])
                .then(() => green('Arquivos apagados com sucesso !'))
                .catch((error) => {
                    red('Falha ao apagar arquivos encryptados');
                    red('error: ', error);
                });
            return;
        }
        red('Não foi possível apagar arquivos encriptados!')
    } catch(error) {
        red('error: ',  error);
    }
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

gulp.task('cleanBkp', cleanBkp);
gulp.task('backupFiles', backupFiles);
gulp.task('deleteOldEncryptedFiles', deleteOldEncryptedFiles);
gulp.task('encryptFiles', encryptFiles);
gulp.task('decrypt', decryptFiles);
gulp.task('encrypt', gulp.series('backupFiles', 'deleteOldEncryptedFiles', 'encryptFiles'));
