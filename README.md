# Frontend Engineering Interview

## Setup

To install dependencies run `pnpm i`.

To launch the application, run `pnpm run dev`.

## Task

Your job is enable cell navigation - similar to that of excel. But we have some very specific behaviour we are trying to achieve. The up / down / left (or shift+tab)/ right (or tab) keyboard events should allow for intercell navigation.

On any given cell, click once - that cell should have an outline, click again (or press enter) and the cell itself should be editable, and have a different colored outline.

With regards to the button popper (one of the cell types you will encounter) - the second click should allow events to pass through to the button (meaning a third click on the button would work), or if they press enter, it should _move_ focus to the button, and it should have an outline (using the css attribute focus-visible). Pressing enter on the focused button should open up the popper. From here, when the popper is focused (which will be a portal), the cell should still have the colored outline (to indicate we are editing within the cell), and the focus should be transferred to the popper. Do this by changing the contents of the popper.

Bonus points if you switch out the contents of the popper to something that has nested keyboard navigation (another table within the popper).

You are encouraged to use AI in your solution, and refactor code as neccesary - what you start with will not look like the final solution.

# Duration

If you've worked with keyboard events before, this should take a couple of hours. If not, it may take longer. Please don't spend longer than 2 hours on it, and submit your progress around that point. Do so by opening up a PR, or by forking it and emailing me the link.

Feel free to email me with any questions you might have - james@solo.one.
