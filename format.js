
/**
 * A partir du code d'une touche, cette fonction renvoie le code d'une touche correspondant � un caract�re sans accent
 */
function getKeyCodeNoAccent(keyCode)
{
	switch (keyCode)
	{
    	/* �, �, � => a */
		case 224: case 226: case 228:
			return 97;
        /* �, �, �, � => e */
		case 233: case 232: case 234: case 235:
			return 101;
		/* �, � => i */
		case 238: case 239:
			return 105;
		/* �, � => o */
		case 244: case 246:
			return 111;
		/* �, �, � => u */
		case 249: case 251: case 252:
			return 117;
		/* � => c */
		case 231:
			return 99;
		/* aucun des cas */
		default:
	}
	
    return keyCode;
}


/**
 * Conversion � la saisie des caract�res en majuscule sans accent
 * Note : �v�nement � attacher � une zone de texte (�l�ment input DOM elt) de la fa�on suivante :
 * M�thode �v�nementielle :
 *  - elt.onkeypress = conversionMajuscule;
 *  - elt.onpaste = conversionMajuscule;
 * M�thode inline XHTML :
 *  - onkeypress="conversionMajuscule();"
 *  - onpaste="conversionMajuscule();"
 *  @param e Ev�nement
 */
function conversionMajuscule(e)
{
	var evt = e || window.event;

	if (evt.target && evt.type == 'keypress')   // IE >= 9, Chrome, Firefox
	{
		var keyCode = getKeyCodeNoAccent((evt.which || evt.keyCode) * 1);

	    if (keyCode >= 97 && keyCode <= 122) // 97 = a, 122 = z
	    {
	        var charStr = String.fromCharCode(keyCode); // renvoie le caract�re
			var sStart = evt.target.selectionStart;
			var sEnd = evt.target.selectionEnd;

	        evt.target.value = evt.target.value.substr(0, sStart) + charStr.toUpperCase() + evt.target.value.substr(sEnd);
			evt.target.selectionStart = sStart + 1;
			evt.target.selectionEnd = evt.target.selectionStart;
			evt.preventDefault();
	    }
	}
	else if (evt.target && evt.type == 'paste')   // IE >= 9, Chrome, Firefox
	{
		// R�cup�ration de la cha�ne � coller
		var data = '';
		if (evt.clipboardData && /text\/plain/.test(evt.clipboardData.types))
			data = evt.clipboardData.getData('text/plain');
		else if (window.clipboardData)
			data = window.clipboardData.getData('text');

		if (data)
		{
			// Position du curseur dans la zone de texte
			var sStart = evt.target.selectionStart;
			var sEnd = evt.target.selectionEnd;

			// Nettoyage sans accent de la cha�ne caract�re par caract�re
			var dataUpdate = '';
			for (var i = 0; i < data.length; i++)
			{
				dataUpdate += String.fromCharCode(getKeyCodeNoAccent(data.charCodeAt(i)));
			}

			// Int�gration de la cha�ne dans la zone de texte � l'emplacement de la s�lection ou du curseur
			evt.target.value = evt.target.value.substr(0, sStart) + dataUpdate.toUpperCase() + evt.target.value.substr(sEnd);
			evt.target.selectionStart = sStart + data.length;
			evt.target.selectionEnd = evt.target.selectionStart;
			evt.preventDefault();
		}
	}
	else if (!evt.target)   // IE < 9 (obsol�te)
	{
		var keyCode = getKeyCodeNoAccent((evt.which || evt.keyCode) * 1);

		if (keyCode >= 97 && keyCode <= 122) // 97 = a, 122 = z
	    {
	        charStr = String.fromCharCode(keyCode); // renvoie le caract�re
            evt.keyCode = charStr.charCodeAt(0) - 32;	// modification du caract�re saisie
	    }
	}
}


/**
 * Blocage � la saisie des caract�res non num�riques
 * Note : �v�nement � attacher � une zone de texte (�l�ment input DOM elt) de la fa�on suivante :
 *  - elt.onkeypress = chiffres;
 *  @param e Ev�nement
 */
function chiffres(e)
{
	var evt = e || window.event;

	// Inhibe les toutes les touches sauf 0123456789
	if (evt.keyCode < 48 || evt.keyCode > 58)
	{
		if (evt.stopPropagation)   // IE >= 9, Chrome, Firefox
		{
			evt.stopPropagation();
			evt.preventDefault();
		}
		else   // IE < 9 (obsol�te)
		{
			evt.cancelBubble = true;
			evt.returnValue = false;
		}
	}
}


/**
 * Conversion et contr�le � la saisie des caract�res en nombre d�cimal
 * (d�pr�ci� car nom compatible Firefox)
 */
function ctrlNumerique(zone, nbDecimal, maxLength)
{
	var evt = window.event ? window.event : null;   // Non compatible Firefox

	if (evt)   // IE8, IE9+, Chrome
	{
		ctrlSaisieNumerique(evt, nbDecimal, maxLength);
	}
}



/**
 * Conversion et contr�le � la saisie des caract�res en nombre d�cimal (keypress et paste)
 * M�thode �v�nementielle :
 *  - elt.onkeypress = function(e) { ctrlNumerique(e, nbDecimal, maxLength);
 *  - elt.onpaste = function(e) { ctrlNumerique(e, nbDecimal, maxLength);
 *  @param e Ev�nement
 *  @param nbDecimal Nombre de d�cimales
 *  @param maxLength Longueur maximale de la zone
 */
function ctrlSaisieNumerique(e, nbDecimal, maxLength)
{
	var evt = e || window.event;
	maxLength = maxLength || 0;	// valeur par d�faut de maxLength (0 = illimit�)
	nbDecimal = nbDecimal || 0;	// valeur par d�faut de nbDecimal (0 = aucune d�cimale)
	
	if (evt && evt.target)   // IE >= 9, Chrome
	{
		var valueRegex = new RegExp("^(|\-?[0-9]*"+(nbDecimal > 0 ? "(|,[0-9]{0,"+nbDecimal+"})" : "")+")$");
		var value = evt.target.value;
		var sStart = evt.target.selectionStart;
		var sEnd = evt.target.selectionEnd;

		if (evt.type == 'keypress')
		{
			var charCode = evt.which || evt.keyCode;
			var charStr = String.fromCharCode(charCode).replace('.', ',');

			var valueUpdate = evt.target.value.substr(0, sStart) + charStr + evt.target.value.substr(sEnd);

			if ((maxLength > 0 && valueUpdate.length > maxLength) || !valueUpdate.match(valueRegex))
			{
				evt.preventDefault();
				return;
			}

			// console.log('keypress - positions ' + sStart + '/' + sEnd + ' > ' + charStr);
			evt.target.value = valueUpdate;
			evt.target.selectionStart = sStart + 1;
			evt.target.selectionEnd = evt.target.selectionStart;
			evt.preventDefault();
		}
		else if (evt.type == 'paste')
		{
			// R�cup�ration de la cha�ne � coller
			var data = '';
			if (evt.clipboardData && /text\/plain/.test(evt.clipboardData.types))
				data = evt.clipboardData.getData('text/plain').replace('.', ',');
			else if (window.clipboardData)
				data = window.clipboardData.getData('text').replace('.', ',');

			if (data)
			{
				// Int�gration de la cha�ne dans la zone de texte � l'emplacement de la s�lection ou du curseur
				var valueUpdate = evt.target.value.substr(0, sStart) + data + evt.target.value.substr(sEnd);

				// Contr�le de la validit� de la cha�ne � mettre � jour dans le contr�le
				if ((maxLength > 0 && valueUpdate.length > maxLength) || !valueUpdate.match(valueRegex))
				{
					evt.preventDefault();
					return;
				}

				// console.log('paste - positions ' + sStart + '/' + sEnd + ' > ' + charStr);
				evt.target.value = valueUpdate;
				evt.target.selectionStart = sStart + data.length;
				evt.target.selectionEnd = evt.target.selectionStart;
				evt.preventDefault();
			}
		}
	}
	else if (evt && evt.srcElement)   // IE < 9 (obsol�te)
	{
	    var jj=evt.keyCode;
	    var zone = evt.srcElement;
	    var valeur = zone.value; // valeur de la zone de saisie
	    if (maxLength > 0 && valeur.length >= maxLength)
	    { // controle longueur de la zone saisie
	        evt.keyCode=0; return;
	    }
	    /* Remplacement du point par la virgule */
	    if ((jj == 44) || (jj == 46)) // 44 = virgule; 46 = point
	    {
	        evt.keyCode=44;
	    }
	    /* que caract�res : point, moins '-' et de 0 � 9 autoris�s */
	    if (jj==44 || jj==46 || jj==45 || (jj>=48 && jj<=57) )
	    {
	        if (nbDecimal<1 && (jj==44 || jj==46)) // pas de saisie de point si pas de d�cimale
	        {
	            evt.keyCode=0;
	            return;
	        }
	        if (jj==44 || jj==46) // recherche si virgule d�j� saisie, si oui, annulation frappe de caract�re
	        {
	            if (valeur.lastIndexOf(",") > -1)
	            {
	                evt.keyCode=0; return;
	            }
	            return ;
	        }
	        if (jj==45) // recherche si moins '-' d�j� saisi; si oui, annulation frappe de caract�re
	        {
	            if (valeur.lastIndexOf(",") > -1)
	            {
	                evt.keyCode=0; return;
	            }
	            zone.value="-"+valeur;
	            evt.keyCode=0; return;
	        }

	        // Contr�le du nombre de d�cimales saisi (code sp�cifique IE)
	        if (valeur.lastIndexOf(",") > -1 && typeof chemin.selection != 'undefined')
	        {
	            var range = chemin.selection.createRange();
	            var textSelect = range.text; // textSelect va contenir le texte "surlign�" lors de la saisie
	            range.text = "|";  // zone.value est modifi� � partir de ce point
	            range = chemin.selection.createRange();

	            var findPosPipe = zone.value.indexOf("|");
	            var findPosComma = zone.value.indexOf(",");

	            if (findPosPipe > findPosComma && findPosComma > -1)
	            {
	                var lg = zone.value.substr(findPosComma + 1).length;
	                if (lg > nbDecimal) // plus de x d�cimales saisies
	                {
	                    if (textSelect.length == 0)
	                    {
	                        range.moveStart('character', -1);
	                    }
	                    range.text = "";
	                    range = chemin.selection.createRange();
	                    if (textSelect.length > 0)
	                    {
	                        range.moveStart('character', 1);
	                    }
	                    range.select();
	                    evt.keyCode=0;
	                    return;
	                }
	            }
	            if (textSelect.length == 0)
	            {
	                range.moveStart('character', -1);
	            }
	            range.text = String.fromCharCode(evt.keyCode);
	            range = chemin.selection.createRange();
	            if (textSelect.length > 0)
	            {
	                range.moveStart('character', 1);
	            }
	            range.select();
	            evt.keyCode=0;
	            return;
	        }
	        return;
	    }
	    evt.keyCode=0;
	}
	
}


/**
 * Conversion et contr�le � la saisie des caract�res pour g�rer une date (aa/mm/jjjj)
 * Note : �v�nement � attacher � une zone de texte (�l�ment DOM elt) de la fa�on suivante :
 *  - elt.onkeypress = ctrlSaisieDate(this);
 *  - elt.onpaste = ctrlSaisieDate(this);
 *  @param zone El�ment DOM de la zone de texte (obsol�te sous IE8)
 */
function ctrlSaisieDate(zone)
{
	var evt = window.event ? window.event : null;   // Non compatible Firefox

	if (evt && evt.target)   // IE >= 9, Chrome
	{
		var valueRegex = new RegExp('^(|[0-9]{1,2}(|\/[0-9]{1,2}(|\/[0-9]{1,4})))$');
		var value = evt.target.value;
		var sStart = evt.target.selectionStart;
		var sEnd = evt.target.selectionEnd;

		if (evt.type == 'keypress')
		{
			var charCode = evt.which || evt.keyCode;
			var charStr = String.fromCharCode(charCode);

			var valueUpdate = evt.target.value.substr(0, sStart) + charStr + evt.target.value.substr(sEnd);
			var offset = 1;

			if (!valueUpdate.match(valueRegex))
			{
				valueUpdate = evt.target.value.substr(0, sStart) + '/' + charStr + evt.target.value.substr(sEnd);
				offset = 2;
				if (valueUpdate.length > 10 || !valueUpdate.match(valueRegex))
				{
					evt.preventDefault();
					return;
				}
			}

			// console.log('keypress - positions ' + sStart + '/' + sEnd + ' > ' + charStr);
			evt.target.value = valueUpdate;
			evt.target.selectionStart = sStart + offset;
			evt.target.selectionEnd = evt.target.selectionStart;
			evt.preventDefault();
		}
		else if (evt.type == 'paste')
		{
			// R�cup�ration de la cha�ne � coller
			var data = '';
			if (evt.clipboardData && /text\/plain/.test(evt.clipboardData.types))
				data = evt.clipboardData.getData('text/plain');
			else if (window.clipboardData)
				data = window.clipboardData.getData('text');

			if (data)
			{
				// Int�gration de la cha�ne dans la zone de texte � l'emplacement de la s�lection ou du curseur
				var valueUpdate = evt.target.value.substr(0, sStart) + data + evt.target.value.substr(sEnd);

				// Contr�le de la validit� de la cha�ne � mettre � jour dans le contr�le
				if (valueUpdate.length > 10 || !valueUpdate.match(valueRegex))
				{
					evt.preventDefault();
					return;
				}

				// console.log('paste - positions ' + sStart + '/' + sEnd + ' > ' + charStr);
				evt.target.value = valueUpdate;
				evt.target.selectionStart = sStart + data.length;
				evt.target.selectionEnd = evt.target.selectionStart;
				evt.preventDefault();
			}
		}
	}
	else if (evt)   // IE < 9 (obsol�te)
	{
	    /* suppression d'une �ventuelle s�lection de texte sur le KeyPress */
	    var lenSelection = 0;
	    if (document.selection)
	    {
	        /* Pour IE qui ne sait pas faire comme tout le monde */
	        var objSelection = document.selection.createRange();
	        lenSelection = objSelection.text.length;
	        objSelection.text = "";
	    }
	
	    var touche=event.keyCode;
	    var valeur=zone.value; // valeur de la zone de saisie
	
	    if (valeur.length >= 10)
	    { /* controle la longueur de la zone saisie maxi : 10 caract�res */
	        event.keyCode=0;
	        return;
	    }
	    /* que caract�res : "/" (pav� num�rique ou clavier) et de 0 � 9 autoris�s */
	    if (touche==47 || (touche>=48 && touche<=57))
	    {
	        if(lenSelection == 0 && (valeur.length == 2 || valeur.length == 5)) /* il faut un "/" en position 3 et 6 */
	        {
	            if(touche != 47)
	            {
	                /* ajout du '/' en bonne position en cours de frappe */
	                document.getElementById(zone).value = valeur + "/" + String.fromCharCode(event.keyCode);
	                event.keyCode=0;
	                return;
	            }
	        }
	        else
	        {
	            if(touche == 47)
	            {
	                event.keyCode=0;
	                return;
	            }
	        }
	        return;
	    }
	    event.keyCode=0;
	}
}

	
/**
 * Conversion et contr�le � la saisie des caract�res pour g�rer une heure (hh:mm)
 * Note : �v�nement � attacher � une zone de texte (�l�ment DOM elt) de la fa�on suivante :
 *  - elt.onkeypress = function(e) { ctrlSaisieHeure(e, this); };
 *  - elt.onpaste = function(e) { ctrlSaisieHeure(e, this); };
 *  @param e Ev�nement
 *  @param zone El�ment DOM de la zone de texte
 */
function ctrlSaisieHeure(e, zone)
{
	var evt = e || window.event;

	if (evt && evt.target)   // IE >= 9, Chrome
	{
		var valueRegex = new RegExp('^(|([0-2]$|[0-1][0-9]|2[0-3])(|:([0-5][0-9]?)))$');
		var value = evt.target.value;
		var sStart = evt.target.selectionStart;
		var sEnd = evt.target.selectionEnd;

		if (evt.type == 'keypress')
		{
			var charCode = evt.which || evt.keyCode;
			var charStr = String.fromCharCode(charCode).replace(',', ':').replace('.', ':');

			var valueUpdate = evt.target.value.substr(0, sStart) + charStr + evt.target.value.substr(sEnd);
			var offset = 1;

			if (!valueUpdate.match(valueRegex))
			{
				valueUpdate = evt.target.value.substr(0, sStart) + ':' + charStr + evt.target.value.substr(sEnd);
				offset = 2;
				if (valueUpdate.length > 5 || !valueUpdate.match(valueRegex))
				{
					evt.preventDefault();
					return;
				}
			}

			// console.log('keypress - positions ' + sStart + '/' + sEnd + ' > ' + charStr);
			evt.target.value = valueUpdate;
			evt.target.selectionStart = sStart + offset;
			evt.target.selectionEnd = evt.target.selectionStart;
			evt.preventDefault();
		}
		else if (evt.type == 'paste')
		{
			// R�cup�ration de la cha�ne � coller
			var data = '';
			if (evt.clipboardData && /text\/plain/.test(evt.clipboardData.types))
				data = evt.clipboardData.getData('text/plain').replace(',', ':').replace('.', ':');
			else if (window.clipboardData)
				data = window.clipboardData.getData('text').replace(',', ':').replace('.', ':');

			if (data)
			{
				// Int�gration de la cha�ne dans la zone de texte � l'emplacement de la s�lection ou du curseur
				var valueUpdate = evt.target.value.substr(0, sStart) + data + evt.target.value.substr(sEnd);

				// Contr�le de la validit� de la cha�ne � mettre � jour dans le contr�le
				if (valueUpdate.length > 5 || !valueUpdate.match(valueRegex))
				{
					evt.preventDefault();
					return;
				}

				// console.log('paste - positions ' + sStart + '/' + sEnd + ' > ' + charStr);
				evt.target.value = valueUpdate;
				evt.target.selectionStart = sStart + data.length;
				evt.target.selectionEnd = evt.target.selectionStart;
				evt.preventDefault();
			}
		}
	}
	else if (evt)   // IE < 9 (obsol�te)
	{
	    zone.focus();
	    var jj = event.keyCode;
	    var valeur = zone.value; // valeur de la zone de saisie
	    /* Remplacement du point et de la virgule par deux points */
	    if (jj == 44 || jj == 46 || jj == 58) // 44 = virgule; 46 = point
	    {
	        if (valeur.length==2 && valeur.lastIndexOf(":") == -1)
	        {
	            event.keyCode=58;
	            return;
	        }
	        else
	        {
	            event.keyCode=0;
	            return;
	        }
	    }
	    /* que caract�res de 0 � 9 autoris�s */
	    else if (jj<48 || jj>57)
	    {
	        event.keyCode=0;
	        return ;
	    }
	
	    if (valeur.length==0)
	    {
	        if (event.keyCode>50) // pas sup�rieur � 2 si premier chiffre
	        {
	            event.keyCode=0;
	            return;
	        }
	    }
	    else if(valeur.length==1)
	    {
	        if(valeur==2 && event.keyCode>51) // pas sup�rieur � 4 si premier chiffre = 2
	        {
	            event.keyCode=0;
	            return;
	        }
	    }
	    else if(valeur.length==2)
	    {
	        if(event.keyCode!=58)
	        {
	            /* ajout du ':' en bonne position en cours de frappe */
	            document.getElementById(zone.id).value = valeur + ":" + String.fromCharCode(event.keyCode);
	            event.keyCode=0;
	            return;
	        }
	    }
	    else if(valeur.length==3)
	    {
	        if(event.keyCode>53) // pas sup�rieur � 4 si premier chiffre
	        {
	            event.keyCode=0;
	            return;
	        }
	    }
	
	    if (valeur.length==5)
	    { // controle longueur de la zone saisie
	        event.keyCode=0; return;
	    }
	}
}


/**
 * Conversion en majuscule et contr�le � la saisie de caract�res non pr�sents dans un tableau param�tr�
 * @param e Ev�nement
 * @param arrayCaracteresInterdits Array de code de caract�res (keypress)
 */
function majusculeSansCaracteres(e, arrayCaracteresInterdits)
{
	if (Object.prototype.toString.call(arrayCaracteresInterdits) !== '[object Array]')
		return;

	var evt = e || window.event;

	if (evt.target)		// IE >= 9, Chrome, Firefox
	{
		if (evt.type == 'keypress')
		{
			var keyCode = (evt.keyCode || evt.which) * 1;

		    /* Pas de saisie d'un des caract�res interdits */
		    if (arrayCaracteresInterdits.indexOf(keyCode) >= 0)
		    {
		    	evt.preventDefault();
		    	return;
		    }
		    
	    	conversionMajuscule(evt);
		}
		else if (evt.type == 'paste')
		{
			// R�cup�ration de la cha�ne � coller
			var data = '';
			if (evt.clipboardData && /text\/plain/.test(evt.clipboardData.types))
				data = evt.clipboardData.getData('text/plain');
			else if (window.clipboardData)
				data = window.clipboardData.getData('text');

			if (data)
			{
				// Position du curseur dans la zone de texte
				var sStart = evt.target.selectionStart;
				var sEnd = evt.target.selectionEnd;

				// Nettoyage sans accent de la cha�ne caract�re par caract�re
				var dataUpdate = '';
				for (var i = 0; i < data.length; i++)
				{
					/* Pas de saisie de caract�res interdits */
				    if (arrayCaracteresInterdits.indexOf(data.charCodeAt(i)) >= 0)
				    	continue;
					dataUpdate += String.fromCharCode(getKeyCodeNoAccent(data.charCodeAt(i)));
				}

				// Int�gration de la cha�ne dans la zone de texte � l'emplacement de la s�lection ou du curseur
				evt.target.value = evt.target.value.substr(0, sStart) + dataUpdate.toUpperCase() + evt.target.value.substr(sEnd);
				evt.target.selectionStart = sStart + data.length;
				evt.target.selectionEnd = evt.target.selectionStart;
				evt.preventDefault();
			}
		}	
	}
	else if (evt)	// IE < 9 (obsol�te)
	{
	    var keyCode = (evt.keyCode || evt.which) * 1;

	    for (var i = 0; i < arrayCaracteresInterdits.length; i++)
	    {
	    	/* Pas de saisie de caract�res interdits */
		    if (keyCode == arrayCaracteresInterdits[i])
		    {
		    	evt.keyCode = 0;
		    	return;
		    }
	    }

	    conversionMajuscule(evt);
	}
}

function majusculeSansBlancSansCote(e)
{
	majusculeSansCaracteres(e, [32, 39, 34]);
}

function majusculeSansBlanc(e)
{
	majusculeSansCaracteres(e, [32]);
}

function majusculeSansCote(e)
{
	majusculeSansCaracteres(e, [39, 34]);
}

