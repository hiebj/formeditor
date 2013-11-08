/**
 * @author hiebj (Jonathan Hieb)
 * 
 * FormEditor is an extension of {@link Ext.grid.CellEditor} that attaches a floating {@link Ext.form.Panel} to the
 * cell editor's field.
 * 
 * The form can be configured with any fields desired, and its alignment to the cell can be configured via the
 * form's {@link Ext.Component#defaultAlign property}. The form will be "saved" when the Editor completes its edit. By default,
 * the fields will be saved directly to the edited row's underlying {@link Ext.data.Model} instance by calling
 * {@link Ext.form.Panel#updateRecord}. This behavior can be customized by configuring the FormEditor with
 * overrides for {@link #loadForm} and {@link #saveForm}.
 * 
 * For a live example, check out the Fiddle: https://fiddle.sencha.com/#fiddle/1ao
 */
Ext.define('Ext.ux.grid.FormEditor', {
	extend : 'Ext.grid.CellEditor',
	alias : 'widget.formeditor',
	
	/**
	 * @cfg {Ext.form.Panel/Object} form
	 * The form to float next to the editor while the editor is active.
	 */
	form : null,
	
	initComponent : function() {
		if (!this.form.isInstance) {
			Ext.applyIf(this.form, {
				xtype : 'form',
				floating : true,
				hidden : true
			});
			this.form = Ext.widget(this.form);
		}
		var fieldListeners = {
			blur : {
				fn : this.onFieldBlur,
				// Slight delay so that we can check to see where the focus went
				delay : 1
			},
			specialkey : this.onSpecialKey,
			scope : this
		};
		this.form.getForm().getFields().each(function(field) {
			this.mon(field, fieldListeners);
		}, this);
		// Use a handler for onComplete rather than an override - we only want to catch successful edits
		this.on('complete', this.onComplete, this);
		this.callParent(arguments);
	},
	
	/**
	 * @private
	 * @override
	 * Invoke {@link #loadForm} and show the form if it does not return false
	 */
	startEdit : function(el, value) {
		this.callParent(arguments);
		// this.editingPlugin is set during {@link Ext.grid.plugin.CellEditing#getEditor}
		var context = this.editingPlugin.context;
		this.allowBlur = false;
		if (this.loadForm(this.form, context) !== false) {
			this.formEditing = true;
			this.form.showBy(this);
		}
		this.allowBlur = true;
	},
	
	/**
	 * @private
	 * Invoke {@link #saveForm}
	 */
	onComplete : function() {
		if (this.formEditing) {
			this.saveForm(this.form, this.editingPlugin.context);
		}
		delete this.formEditing;
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
	loadForm : function(form, context) {
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
	saveForm : function(form, context) {
		form.getForm().updateRecord(context.record);
	},
	
	/**
	 * @private
	 * @override
	 * Prevent blur when the target is within the floating form
	 */
	onFieldBlur : function(field, e) {
		if (e) {
			var fieldFocused = this.field.hasFocus || !Ext.isEmpty(this.form.query('[hasFocus]')),
				active = Ext.Element.getActiveElement(),
				target = e.getTarget();
			if (field.inputEl.contains(target)) {
				// The target of a field's 'blur' should never be the field itself
				target = e.getRelatedTarget();
			}
			if (!fieldFocused) {
				if (this.contains(active) || this.contains(target)) {
					// The field has lost focus to another element we own, but the target wasn't a field.
					// Restore focus to the field.
					field.focus();
				} else {
					this.callParent([ this.field, e ]);
				}
			}
		} else {
			this.callParent([ this.field, e ]);
		}
	},
	
	contains : function(el) {
		return this.getEl().contains(el) || (this.form.rendered && this.form.getEl().contains(el));
	},
	
	/**
	 * @private
	 * @override
	 * Hide the form
	 */
	hideEdit : function() {
		this.callParent(arguments);
		this.form.hide();
	},
	
	/**
	 * @private
	 * @override
	 * Reset the form on cancel
	 */
	cancelEdit : function() {
		if (this.formEditing) {
			this.form.getForm().reset();
		}
		delete this.formEditing;
		this.callParent(arguments);
	}
});