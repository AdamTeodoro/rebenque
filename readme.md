<h1>Rebenque</h1>

<h2>Descrição</h2>
<h3>Com essa ferramenta você pode encriptar seu projeto</h3>

<h2>Começando<h2>

<h3>Passo 1</h3>
<h4>Faça o clone desse repositório dessa maneira para dentro da raiz do seu projeto: </h4>

```
    git clone https://github.com/AdamTeodoro/rebenque.git
```

<h3>Passo 2</h3>
<h4>Configure no arquivo 'gulpfile.js', adicione o caminho para a pasta RAIZ do seu projeto, com o seu código fonte: </h4>

```
    //padrão
    const ENVIRONMENT = {
        PROJECT_FOLDER_ROOT: '../',
    }
```

<h3>Passo 3</h3>
<h4>Configure arquivos que não devem ser encriptados, que devem ser ignorados, o caminho para os arquivos ignorados devem começar a partir da raiz do projeto, como por exemplo:</h4>

```
    const ENVIRONMENT = {
        . . .
        FILE_NAMES_TO_IGNORE: [
            'package-lock.json',
            'node_modules/**/*.*',
            'src/arquivo_que_deve_ser_ignorado.extensão_do_arquivo'
        ]
    }
```

<h3>Passo 4</h3>
<h4>
    Configure o destino do código fonte encriptado, dessa maneira: 
</h4>

```
    const ENVIRONMENT = {
        . . .
        ENCRYPTED_FOLDER: './caminho-para-onde-o-codigo-encriptado-deve-ser-escrito'
    }

```

<h3>Passo 5</h3>
<h4>
    Configure o destino do código desencriptado:
</h4>

```
    const ENVIRONMENT = {
        . . .
        DECRYPTED_FOLDER: './caminho-para-onde-o-codigo-desencriptado-deve-ser-escrito'
    };

```

<h3>Passo 6</h3>
<h4>
    Adicione sua senha de encriptação na variável: '<b>SECRET_KEY</b>'
</h4>

```
    const ENVIRONMENT = {
        . . .
        SECRET_KEY: 'SUA SENHA SEGURA'
    };

```

<h3>Passo 7</h3>
<h4>Agora você pode criar uma '.git' na sua 'ENCRIPTED_FOLDER' e fazer commits encriptados para o repositório remoto.</h4>

<h3>Passo 8</h3>
<h4>Não se esqueça! é necessário instalar as dependências na raiz do rebenque para que o rebenque funcione:</h4>

```
    npm install --save
```
<h3>Passo 9</h3>
<h4>Entendendo os comandos:</h4>

<br />

<h4>Os comandos só funcionam dentro da pasta do rebenque!</h4>

<br />

<h5>Comando para encriptar, os arquivos da raiz do seu projeto definida em 'PROJECT_FOLDER_ROOT', para a pasta definida nas configurações 'ENCRYPTED_FOLDER':</h5>

```
    npx gulp encrypt
```

<h5>Comando para desencriptar seu código da pasta 'ENCRYPTED_FOLDER' para a pasta 'DECRYPTED_FOLDER':</h5>

```
    npx gulp decrypt
```

<h3>Passo 10</h3>
<h4>Você pode fazer commits para o repositório remoto na pasta 'ENCRYPTED_FOLDER', enviando para o git um código versionado e encriptado</h4>

<h1>DICA</h1>
<h2>Crie um repositório apenas LOCALMENTE na raíz do projeto, para continuar usando as funcionalidades da IDE relacionadas ao git, funcionalidades como:</h2>

<h3>1 - verificar mudanças em arquivos</h3>
<h3>2 - desfazer mudanças de arquivos</h3>
<h3>3 - controle de versão local</h3>

