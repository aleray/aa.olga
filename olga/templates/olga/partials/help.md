1. [Getting started](#getting-started)
2. [Hotglue interface](#hotglue-interface)
3. [Syntax](#syntax)
4. [Layout](#layout)
5. [Extended help](#extended-help)


Getting started {: #getting-started }
=====================================

Create a new page
-----------------

Two options:

1. give your page a title in the url-field
2. create a link from another page `[[Title of new page]]`

Use a capital letter for the first letter.

For a collection page: `[[dc:isPartOf::Blabla]]`


Hotglue interface {: #hotglue-interface }
=========================================

Hotglue menu page level
-----------------------

### Save and retrieve a page

![](/static/olga/png/icons/star.png)

Automatically the last version of a page is saved.
Snapshot a page via the star in the hotglue-menu. Open the left sidebar and go
to ‘history’ to revert to an earlier page. Don’t forget to snapshot the last
version of your page.

### Set permissions

![](/static/olga/png/icons/ok.png)

By default a page is visible, but not editable by anonymous users. Open the
hotglue menu and click on the thumb-up to change the permissions. Ask the
administrator of OS to create a group for selected users.

### Create a box

![](/static/olga/png/icons/new.png)

Click on the ‘7bac’-icon in the hotglue menu. Click in the box and click on
‘edit’.

### Edit the right column + change layout of entire page

![](/static/olga/png/icons/edit.png)

Click on the ‘edit’-icon in the hotglue menu. Here you can
give your page another name
make an introduction-note
add a background image
add a stylesheet, or add singular scripts for styling


Hotglue menu box level
----------------------

### Edit box

![](/static/olga/png/icons/edit.png)


### Drag box to other location

![](/static/olga/png/icons/drag.png)

Click this icon and at the same time hold the ‘ctrl’-key: a grid helps you to position.

### Delete box

![](/static/olga/png/icons/delete.png)

### Set slideshow

![](/static/olga/png/icons/target.png)

### Import and export Audacity

![](/static/olga/png/icons/export.png)

### Set visibility of box

![](/static/olga/png/icons/mask.png)

It will add the class ‘collapsed’ or ‘hidden’. Hidden means invisible for
anonymous users. Collapsed will show only the title of the box, unless you
hover over.

### Set transition

![](/static/olga/png/icons/marey.png)

### Set z-index

![](/static/olga/png/icons/layers.png)

To set whether a box is positioned under or above another box. Drag left or
right.


Syntax {: #syntax }
===================

Creating links
--------------

### Link to other website

    [[ http://… ]]

add attribute `{: target="_self"}` if you want the page to open in the same
window

### Link to other Olga-page

    [[Title of linked page]]

add attribute `{:target="_self"}` if you want the page to open in the same
window

### Link to a box on same Olga-page

    [[#uuid annotation]]

### Link to a driver (or a specific time on that driver) on same Olga-page

    [[url of file#t=…]]{: target="multiplex"} 
    [[url of file#t=…]]{: style=“…” target="multiplex"}

Replace the text of the linked page by another text `[[url|new text]]`

eg.

    [[Alessandro|Click here]]
    [[http://…|Click here]]

### Replace the text of the linked page by another text

    [[url|new text]]
eg:

    [[Alessandro|Click here]]
    [[http://…|Click here]]

Title and subsections in a box
------------------------------

Add title in meta-info.

Headers in a box.

    # heading 1
    ## heading 2
    ### heading 3


Embed images, video, sound
--------------------------

### Sound

    [[embed::http://]]
    [[embed::http://….ogg]]{: class='small'}

### Video

    [[embed::http://….]]

### Images

    [[embed::http://….jpg]]

### Filters

Black and white

    [[ embed::http://  .jpg||bw ]]

Thumbnail

    [[ embed::http://  .jpg||thumb ]]

Black and white & Thumbnail

    [[ embed::http://  .jpg||bw|thumb ]]

Resize

    [[ embed::http://  .jpg||bw|resize:256 ]]

An image as link:

    <a href="http://www.jvea.org/" target="_blank"><img src="http://repo.sarma.be/Zilver%20Flotations/A%20day%20with.jpg" /></a>


Synchronizing, slideshow and short-cuts
---------------------------------------

### Connect driver to annotation box

Paste its url in the ‘about’-metadata of the annotation box.

### Connect box to main page to create general timeline

This is the default setting of the ‘about’-metadata of a box. The general
timeline is automatically created by creating timecodes.

### Connect a box to itself to create a slideshow

Drag the circles-icon in the hotglue menue of a box to the same box. Set
‘class’-metadata on ‘active-only’

### Use shortcuts

`CTRL + SHIFT + arrow up`
: pause and play
`CTRL + SHIFT + arrow down`
: paste time code
`CTRL + SHIFT + arrow right`
: forward
`CTRL + SHIFT + arrow left`
: rewind

`8<`
: to set the duration of a section, default is 5sec
`8< 00:00:10`
: to set the duration of a section to 10 sec instead of default value 5 sec. From then on all sections are 10 sec.

### Set beginning and end time

Beginning time 10 sec:

    http://repo.sarma.be/julien%20bruneau/ghost%201.webmsd.webm#t=10

End time 20 sec:

    http://repo.sarma.be/julien%20bruneau/ghost%201.webmsd.webm#t=10,20


Attributes under class
----------------------

-  collapsed
-  hidden
-  active-only: active time only
-  nosubdivision: to do away with the division lines in a box
-  notimecodes
-  non-automatic play
-  hover-top: if you hover over a box, it will come front: is now by defaut

No semicolons between the attributes!!
If you don’t want any class attribute after you had tried some, you have to write “” to replace attributes


Layout {: #layout }
===================

Attributes under style
----------------------

-  z-index: slider
-  left
-  top
-  color
-  opacity
-  font-style
-  background-color
-  outline-color
-  outline
-  font
-  font-size
- text-align
- padding-left, -right, -top
- margin-top, -right…
- line-height
- letter-spacing
- text-indent

Change the colour of a part of the text
---------------------------------------

eg: I am `%%blue%%{: style="color: blue" }`, will produce: I am blue.
eg: My background is `%%yellow%%{: style="background-color: yellow" }`, will produce: My background is yellow.

Change the colour of a hyperlink
--------------------------------

    [[Page name]]{: style="color: pink; text-decoration: none” }

Italic and bold
---------------

`*word*` will make the section italic
`**word**` will make the section bold

Add another stylesheet
----------------------

Click on ‘edit’ in the page-related hotglue-menu. Add the url of your stylesheet.

Use more colours
----------------

eg: ‘rgb(0,255,0)’
RGB-color charts: http://www.rapidtables.com/web/color/RGB_Color.htm

Include a blank space
---------------------

    `%%space%%{: style="color: white" }`  or `{: style="color: transparent" }` if the background color of the box is not white.

Make a list
-----------

    *  item 1
    *  item 2
    *  item 3

    -  item 1
    -  item 2
    -  item 3

    1.   item 1
    2.   item 2
    3.   item 3
