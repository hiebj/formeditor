Ext.ux.grid.FormEditor is an extension of Ext.grid.CellEditor that attaches a floating Ext.form.Panel to the cell editor's field.

The form can be configured with any fields desired, and its alignment to the cell can be configured via the form's `defaultAlign` property. The form will be "saved" when the Editor completes its edit. By default, the fields will be saved directly to the edited row's underlying Ext.data.Model instance by calling `updateRecord`. This behavior can be customized by configuring the FormEditor with overrides for `loadForm` and `saveForm`.

This extension has been upgraded to work with Ext JS 5. For a live example of the Ext JS 4 version of this extension, check out the Fiddle: https://fiddle.sencha.com/#fiddle/1ao
