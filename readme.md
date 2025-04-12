

<h1>Rebenque</h1>

<h2>Description</h2>
<h3>With this simple file you can encrypt all your project files before send to github</h3>

<h2>START<h2>
<h3>Step 1</h3>
<h4>Clone this project in your root project</h4>

```
    git clone https://github.com/AdamTeodoro/rebenque.git
```

<h3>Step 2</h3>
<h4>Configure in gulpfile.js the path from the folder with code to encrypt, by default it's: </h4>

```
    const SRCFOLDER = '../src'
```

<h3>Step 3</h3>
<h4>
    Configure in gulpfile.js the path dest to encrypted code files, by default it's:  
</h4>

```
    const ENCRYPTEDFOLDER = 'SRC_ENCRYPTED'
```

<h3>Step 4</h3>
<h4>
    Configure in gulpfile.js the path dest to decrypted code files, by default it's:  
</h4>

```
    const DECRYPTEDFOLDER = 'SRC_DECRYPTED'
```

<h3>Step 5</h3>
<h4>
    Add in gulpfile.js your secret key in variable '<b>SECRETKEY<b>'
</h4>

```
    const SECRETKEY = 'your secret pass'
```

<h3>Step 6</h3>
<h4>Now you can create '.git' in your SRC_ENCRYPTED</h4>

<h3>Step 7<h3>
<h4>You need install dependencies to work, in rebenque folder:<h4>

```
    npm install 
```

<h4><b>IMPORTANT: make sure 'gulp' is installed</b></h4>

<h3>Step 8</h3>
<h4>Understanding commands</h4>

<br />

<b>Command to encrypt your code to SRC_ENCRYPTED:</b>

```
    gulp encrypt
```

<b>Command to decrypt your code to SRC_DECRYPTED:</b>

```
    gulp decrypt
```

<h3>Step 9<h3>
<h4>Copy your dependency list (Ex: JS package.json, python requirements.txt ... ) from the SRC_ENCRYPTED</h4>

<h3>Step 10</h3>
<h4>Now its only generate encrypted code before make your commits in your SRC_ENCRYPTED folder</h4>

