// GLSL parser generated by pegjs - https://www.pegjs.org
/*#include ../peglsl/glsl.js*/

var parse_statements = function (statements, root) {
    var data = [],
        
        declarator,
        statement,
        
        statement_exceptions = {
            htoy: true,
            fline: true
        },
        
        root_declarator_exceptions = {
            resolution: true,
            globalTime: true,
            octave: true,
            mouse: true,
            baseFrequency: true,
            date: true,
            keyboard: true,
            pFrame: true,
            frame: true,
            fragColor: true,
            pKey: true,
            pFrameSynth: true,
            synthOutput: true
        },
        
        i, j;
    
    for (i = 0; i < statements.length; i += 1) {
        statement = statements[i];

        if (statement.name === "main" && 
            statement.type === "function_declaration") {
            
            data = data.concat(parse_statements(statement.body.statements));
        } else if (statement.type === "function_declaration") {
            if ((statement.name in statement_exceptions)) {
                continue;
            }

            data.push({
                type: "function",
                name: statement.name,
                position: statement.position,
                parameters: statement.parameters,
                returnType: statement.returnType
            });
        } else if (statement.type === "declarator") {
            for (j = 0; j < statement.declarators.length; j += 1) {
                declarator = statement.declarators[j];
                
                if (root) {
                    if ((declarator.name.name in root_declarator_exceptions) ||
                       ((declarator.name.name.match(/iInput\d+/g) && statement.typeAttribute.name === "sampler2D")) || declarator.name.name.match(/control\d+/g)) {
                        continue;
                    }
                }

                data.push({
                    type: "declarator",
                    name: declarator.name.name,
                    position: statement.position,
                    returnType: statement.typeAttribute.name
                });
            }
        } else if (statement.type === "preprocessor") {
            data.push({
                type: "preprocessor",
                name: statement.identifier,
                position: statement.position,
                value: statement.token_string
            });
        }
    }
    
    return data;
};

self.onmessage = function (m) {
    "use strict";

    var glsl_code = m.data,
        
        glsl_o,
        
        outline = [];

    /* hack for GLSL 3.0 support */
    glsl_code = glsl_code.replace(/out vec4/g, "vec4"); // out vec4 fragColor;
    glsl_code = glsl_code.replace(/.length()/g, ""); // array.length()
    glsl_code = glsl_code.replace(/mat\d+x\d+/g, ""); // matNxN
    glsl_code = glsl_code.replace(/#version 300 es/g, ""); // GLSL 3.0 define
    glsl_code = glsl_code.replace(/.*\[\d+\].*\[\].*\([\s\S]+?\);$/mg, ""); // array initializer

    try {
        glsl_o = _PEGLSL.parse(glsl_code);
    } catch (e) {
        console.log("parseGLSL : ", e);
    }
    
    if (glsl_o) {
        outline = parse_statements(glsl_o.statements, true);
    }
    
    postMessage(outline);
};
