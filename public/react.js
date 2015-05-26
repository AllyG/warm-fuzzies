var Comment = React.createClass({
	render: function() {
		var rawMarkup = marked(this.props.children.toString(), {sanitze: true});
		return (
			<div className="comment">
				<h2 className="commentAuthor">
					{this.props.author}
				</h2>
				<span dangerouslySetInnerHTML={{__html: rawMarkup}} />
			</div>
		);
	}
});

var CommentList = React.createClass ({
	render: function() {
		var commentNodes = this.props.data.map(function (comment) {
			return (
				<Comment author={comment.author}>
					{comment.text}
				</Comment>
			);
		});
		return (
			<div className="commentList">
				{commentNodes}
			</div>
		);
	}
});

var CommentForm = React.createClass({
	handleSubmit: function(e) {
		e.preventDefault();
		var author = React.findDOMNode(this.refs.author).value.trim();
		var text = React.findDOMNode(this.refs.text).value.trim();
		if (!text || !author) {
			return;
		}
		this.props.onCommentSubmit({author: author, text: text});
		React.findDOMNode(this.refs.author).value = ' ';
		React.findDOMNode(this.refs.text).value = ' ';
		return;
	},
	render: function() {
		return(
			<form className="commentForm" onSubmit={this.handleSubmit}>
				<input className="authorName" type="text" placeholder="Your name" ref="author" />
				<textArea rows="5" placeholder="Write Wei and Tim a message" ref="text" />
				<input type="submit" value="Post" />
			</form>
		);
	}
});


var CommentBox = React.createClass({
	getDefaultProps: function () {
		return {
			pollInterval: 10000
		};
	},
	loadCommentsFromServer: function() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(data) {
				if (this.isMounted())
					this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this),
			complete: function (xhr, status) {
				setTimeout(this.loadCommentsFromServer, this.props.pollInterval);
			}.bind(this)
		});
	},
	handleCommentSubmit: function(comment) {
		var comments = this.state.data;
		var newComments = comments.concat([comment]);
		this.setState({data: newComments});
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			type: 'POST',
			data: comment,
			success: function(data) {
				if (this.isMounted())
					this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	getInitialState: function(){
		return {data: []};
	},
	//method called automatically by React when a component is rendered
	componentDidMount: function() {
		this.loadCommentsFromServer();
	},
	render: function() {
		return(
			<div className="commentBox" >
				<h2>Warm Fuzzies</h2>
				<CommentList data={this.state.data} />
				<CommentForm onCommentSubmit={this.handleCommentSubmit} />
			</div>
		);
	}
});

React.render(
	<CommentBox url="comments.json" pollInterval={ 7500 } />,
	document.getElementById('content')
);
