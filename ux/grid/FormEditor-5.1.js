/**
 * FormEditor is an extension of {@link Ext.grid.CellEditor} that attaches a floating {@link Ext.form.Panel} to the
 * cell editor's field.
 *
 * The form can be configured with any fields desired, and its alignment to the cell can be configured via the
 * form's {@link Ext.Component#defaultAlign property}. The form will be "saved" when the Editor completes its edit. By default,
 * the fields will be saved directly to the edited row's underlying {@link Ext.data.Model} instance by calling
 * {@link Ext.form.Panel#updateRecord}. This behavior can be customized by configuring the FormEditor with
 * overrides for {@link #loadForm} and {@link #saveForm}.
 *
 * This extension has been upgraded to work with Ext JS 5.1.
 * For a live example of the Ext JS 4.x version of this extension, check out the Fiddle: https://fiddle.sencha.com/#fiddle/1ao
 */
Ext.define('Ext.ux.grid.FormEditor', {
    extend: 'Ext.grid.CellEditor',
    alias: 'widget.formeditor',

    /**
     * @cfg {Ext.form.Panel/Object} form
     * The form to float next to the editor while the editor is active.
     */
    form: null,

    /**
     * @override
     */
    initComponent: function () {
        if (!this.form.isInstance) {
            Ext.applyIf(this.form, {
                xtype: 'form',
                floating: true,
                hidden: true
            });
            this.form = Ext.widget(this.form);
        }
        this.form.getForm().getFields().each(function (field) {
            this.mon(field, {
                specialkey: this.onSpecialKey,
                scope: this
            });
        }, this);
        this.callParent(arguments);
    },

    /**
     * @override
     */
    startEdit: function () {
        this.callParent(arguments);
        this.allowBlur = false;
        if (this.loadForm(this.form, this.editingPlugin.context) !== false) {
            this.formEditing = true;
            this.form.show();
            this.form.alignTo(this, 'tl-bl?');
        }
        this.allowBlur = true;
    },

    /**
     * @override
     */
    completeEdit: function () {
        this.allowBlur = false;
        if (this.formEditing) {
            this.saveForm(this.form, this.editingPlugin.context);
            this.form.hide();
        }
        delete this.formEditing;
        this.allowBlur = true;
        this.callParent(arguments);
    },

    /**
     * @override
     */
    cancelEdit: function () {
        this.allowBlur = false;
        if (this.formEditing) {
            this.form.getForm().reset();
            this.form.hide();
        }
        delete this.formEditing;
        this.allowBlur = true;
        this.callParent(arguments);
    },

    /**
     * @override
     */
    onFocusLeave: function () {
        var active = Ext.Element.getActiveElement();
        var formActive = this.form.rendered && this.form.isVisible() && this.form.getEl().contains(active);
        if (!formActive) {
            this.callParent(arguments);
        }
    },

    /**
     * @protected
     * @template
     * Template method called before the form is shown. Override this function to load any existing values into the
     * form's fields. Return false from this function to prevent the form from showing.
     *
     * @param {Ext.form.Panel} form The form
     * @param {Object} context The editing context. This is the very same object that is passed as an argument to
     *        the {@link Ext.grid.plugin.Editing#beforeedit} event.
     * @return {Boolean} Return false to prevent the form from showing
     */
    loadForm: function (form, context) {
        form.loadRecord(context.record);
    },

    /**
     * @protected
     * @template
     * Template method called when the edit is successfully completed. Override this function to save the form's
     * fields.
     *
     * @param {Ext.form.Panel} form The form
     * @param {Object} context The editing context. This is the very same object that is passed as an argument to
     *		the {@link Ext.grid.plugin.Editing#edit} event.
     */
    saveForm: function (form, context) {
        form.getForm().updateRecord(context.record);
    }
});
