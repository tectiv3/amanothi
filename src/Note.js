import React, { Component } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { RichTextEditor, RichTextToolbar } from 'react-native-zss-rich-text-editor';
import KeyboardSpacer from 'react-native-keyboard-spacer';

export default class Note extends Component {

    constructor(props) {
        super(props);
        this.getHTML = this.getHTML.bind(this);
        this.setFocusHandlers = this.setFocusHandlers.bind(this);
    }

    render() {
      return (
          <View style={styles.container}>
            <RichTextEditor
                ref={(r)=>this.richtext = r}
                style={styles.richText}
                initialTitleHTML={'Title!!'}
                initialContentHTML={'Hello <b>World</b> <p>this is a new paragraph</p> <p>this is another new paragraph</p>'}
                editorInitializedCallback={() => this.onEditorInitialized()}
                editorInitializedCallback={() => this.onEditorInitialized()}
                customCSS="body { padding-left:0px; padding-right:0px; }"
                enableOnChange={true}
            />
            <RichTextToolbar getEditor={() => this.richtext} selectedButtonStyle={{backgroundColor: 'skyblue'}} />
            {Platform.OS === 'ios' && <KeyboardSpacer/>}
          </View>
      );
    }

    onEditorInitialized() {
      this.setFocusHandlers();
      this.getHTML();
    }

    async getHTML() {
      const titleHtml   = await this.richtext.getTitleHtml();
      const contentHtml = await this.richtext.getContentHtml();
    }

    setFocusHandlers() {
      this.richtext.setTitleFocusHandler(() => {
        //alert('title focus');
      });
      this.richtext.setContentFocusHandler(() => {
        //alert('content focus');
      });
      this.richtext.registerContentChangeListener(() => {
          console.log('on register content change listener');
      })
    }

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 0,
    paddingTop: 10
  },
  richText: {
    alignItems:'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
