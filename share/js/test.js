    MFILE.currentEmployee.bogusProp = 'bogus';
    if ( DOCHAZKA.empProfile.isPrototypeOf(MFILE.currentEmployee)) {
        console.log("MFILE.currentEmployee is of the correct heritage");
    } else {
        console.log("MFILE.currentEmployee is of incorrect heritage - fixing");
        MFILE.currentEmployee = jQuery.extend(Object.create(DOCHAZKA.empProfile), MFILE.currentEmployee);
    }

    MFILE.currentEmployee.sanitize();
    if (MFILE.currentEmployee.hasOwnProperty('bogusProp')) {
        console.log( "FATAL ERROR IN MFILE.currentEmployee OBJECT", MFILE.currentEmployee);
    }
        
