# Getting Started With Schematics

Template code generator.        
Basically on angular schematics (generate component + service + module).        
This generator is configured to generate a folder structure:
```
| => folder name:
    | => landing
        | => component {ts, html, css}
    | => login
        | => component {ts, html, css}, service {ts}
    | => registration
        | => by code
            | => component {ts, html, css}
        | => open
            | => component {ts, html, css}
        | => by student
            | => component {ts, html, css}
        | => component {ts, html, css}, service {ts}
            | => token
        | => component {ts, html, css}
| => Module for components and routing module {ts, ts}
```

Where each file is generated in its own module.        
Each file has a name specified during generation.   
The generated module is located in the module where we specify

###Install
```
npm i profilum-code-gen
```

###How use
```
ng g profilum-code-gen:ng-landing --name=moscow --module=landing.module
```
And generator maintain many params (from ng g component|service|module), but it's successor angular schematics.


###Available params
| First Header  | Second Header |
| ------------- | ------------- |
| flat  | boolean  |
| inlineStyle  | boolean  |
| inlineTemplate  | string  |
| module | string  |
| path  | string  |
| prefix  | string  |
| project  | string  |
| selector  | string  |
| skipImport  | boolean  |
| skipSelector  | boolean  |
| skipTests  | boolean  |
| type  | string  |
