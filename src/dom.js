/* eslint-disable no-unused-vars */
import React from 'react';

import warning from '../src/utils/warning';

import {
  pdf,
  View,
  Text,
  Link,
  Page,
  Font,
  Note,
  Image,
  Canvas,
  version,
  StyleSheet,
  PDFRenderer,
  // createInstance,
  Document as PDFDocument,
} from './index';

const flatStyles = stylesArray =>
  stylesArray.reduce((acc, style) => ({ ...acc, ...style }), {});

export const Document = ({ children, ...props }) => {
  return <PDFDocument {...props}>{children}</PDFDocument>;
};

class InternalBlobProvider extends React.PureComponent {
  state = { blob: null, url: null, loading: true, error: null };

  constructor(props) {
    super(props);

    // Create new root container for this render
    this.instance = pdf();
  }

  componentDidMount() {
    this.renderDocument();
    this.onDocumentUpdate();
  }

  componentDidUpdate() {
    this.renderDocument();

    // if (this.instance.isDirty() && !this.state.error) {
    //   this.onDocumentUpdate();
    // }
  }

  renderDocument() {
    this.instance.updateContainer(this.props.document);
  }

  onDocumentUpdate() {
    // const oldBlobUrl = this.state.url;

    this.instance.toBlob().then(blob => {
      this.setState({ blob });
      // this.setState(
      //   { blob, url: URL.createObjectURL(blob), loading: false },
      //   () => URL.revokeObjectURL(oldBlobUrl),
      // );
    });
    // .catch(error => {
    //   this.setState({ error });
    //   console.error(error);
    //   throw error;
    // });
  }

  render() {
    return this.props.children(this.state);
  }
}

export const BlobProvider = ({ document: doc, children }) => {
  if (!doc) {
    warning(false, 'You should pass a valid document to BlobProvider');
    return null;
  }

  return <InternalBlobProvider document={doc}>{children}</InternalBlobProvider>;
};

export const PDFViewer = ({
  className,
  style,
  children,
  innerRef,
  ...props
}) => {
  return (
    <InternalBlobProvider document={children}>
      {({ url }) => (
        <iframe
          className={className}
          ref={innerRef}
          src={url}
          style={Array.isArray(style) ? flatStyles(style) : style}
          {...props}
        />
      )}
    </InternalBlobProvider>
  );
};

const DOMNode = ({ type, box = {}, children = [], style = {}, value }) => {
  if (type === 'TEXT_INSTANCE') {
    return <div style={{ boxSizing: 'border-box' }}>{value}</div>;
  }

  const nodeStyle = {
    ...style,
    width: `${box.width || 0}px`,
    height: `${box.height || 0}px`,
    marginTop: `${box.marginTop || 0}px`,
    marginRight: `${box.marginRight || 0}px`,
    marginBottom: `${box.marginBottom || 0}px`,
    marginLeft: `${box.marginLeft || 0}px`,
    paddingTop: `${box.paddingTop || 0}px`,
    paddingRight: `${box.paddingRight || 0}px`,
    paddingBottom: `${box.paddingBottom || 0}px`,
    paddingLeft: `${box.paddingLeft || 0}px`,
    position: `${style.position || 'relative'}`,
    fontSize: `${style.fontSize || 0}px`,
    borderTopWidth: `${style.borderTopWidth || 0}px`,
    borderRightWidth: `${style.borderRightWidth || 0}px`,
    borderBottomWidth: `${style.borderBottomWidth || 0}px`,
    borderLeftWidth: `${style.borderLeftWidth || 0}px`,
    display: `${style.display || 'flex'}`,
    borderStyle: 'solid',
    borderColor: 'black',
    boxSizing: 'border-box',
  };

  if (type === 'PAGE') {
    return (
      <div style={{ ...nodeStyle, border: '1px solid black' }}>
        {children.map((child, i) => (
          <DOMNode key={i} {...child} />
        ))}
      </div>
    );
  }

  return (
    <div style={nodeStyle}>
      {children.map((child, i) => (
        <DOMNode key={i} {...child} />
      ))}
    </div>
  );
};

export const DOMViewer = ({
  className,
  style,
  children,
  innerRef,
  ...props
}) => {
  return (
    <InternalBlobProvider document={children}>
      {({ blob }) => {
        if (!blob || Object.keys(blob).length === 0) return null;

        const doc = blob.children[0];

        return (
          <div style={{ margin: '20px' }}>
            {doc.children.map(page => (
              <DOMNode {...page} />
            ))}
          </div>
        );
      }}
    </InternalBlobProvider>
  );
};

export const PDFDownloadLink = ({
  document: doc,
  className,
  style,
  children,
  fileName = 'document.pdf',
}) => {
  if (!doc) {
    warning(false, 'You should pass a valid document to PDFDownloadLink');
    return null;
  }

  const downloadOnIE = blob => () => {
    if (window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(blob, fileName);
    }
  };

  return (
    <InternalBlobProvider document={doc}>
      {params => (
        <a
          className={className}
          download={fileName}
          href={params.url}
          onClick={downloadOnIE(params.blob)}
          style={Array.isArray(style) ? flatStyles(style) : style}
        >
          {typeof children === 'function' ? children(params) : children}
        </a>
      )}
    </InternalBlobProvider>
  );
};

export {
  pdf,
  View,
  Text,
  Link,
  Page,
  Font,
  Note,
  Image,
  Canvas,
  version,
  StyleSheet,
  PDFRenderer, // createInstance,
} from './index';

export default {
  pdf,
  View,
  Text,
  Link,
  Page,
  Font,
  Note,
  Image,
  Canvas,
  version,
  Document,
  PDFViewer,
  StyleSheet,
  PDFRenderer,
  BlobProvider,
  // createInstance,
  PDFDownloadLink,
};
