import React, { Component, createRef } from 'react';
import {   Switch } from 'react-native';
import { Card, Icon, Rating, Input, keyboardType, TextInput } from 'react-native-elements';
import { connect } from 'react-redux';
import { postComment } from './redux/ActionCreators';
import { postFavorite } from './redux/ActionCreators';
import * as Animatable from 'react-native-animatable';
import { Text, View, ScrollView, FlatList,
    Modal, Button, StyleSheet,
    Alert, PanResponder, Share } from 'react-native';
    
const mapStateToProps = state => {
    return {
        campsites: state.campsites,
        comments: state.comments,
        favorites: state.favorites
    };
};
const mapDispatchToProps = {
    postFavorite: campsiteId => (postFavorite(campsiteId))
};
function RenderCampsite(props) {

    const shareCampsite = (title, message, url) => {
        Share.share({
            title: title,
            message: `${title}: ${message} ${url}`,
            url: url
        },{
            dialogTitle: 'Share ' + title
        });
    };


    const { campsite } = props;


    const view = createRef();
    const recognizeDrag = ({ dx }) => (dx < -200) ? true : false;
    const recognizeComment = ({ moveX }) => (moveX < 200) ? true : false;

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
            view.current.rubberBand(1000)
                .then(endState => console.log(endState.finished ? 'finished' : 'canceled'));
        },
        onPanResponderEnd: (e, gestureState) => {
            console.log('pan responder end', gestureState);
            if (recognizeDrag(gestureState)) {
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + campsite.name + ' to favorites?',
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                            onPress: () => console.log('Cancel Pressed')
                        },
                        {
                            text: 'OK',
                            onPress: () => props.favorite ?
                                console.log('Already set as a favorite') : props.markFavorite()
                        }
                    ],
                    { cancelable: false }
                );
            } else if (recognizeComment(gestureState)) {
                props.onShowModal()
            }
            return true;
        }
    });

    if (campsite) {
        return (
            <Animatable.View
                animation='fadeInDown'
                duration={2000}
                delay={1000}
                ref={view}
                {...panResponder.panHandlers}>
                <Card
                    featuredTitle={campsite.name}
                    image={require('./images/react-lake.jpg')}>
                    <Text style={{ margin: 10 }}>
                        {campsite.description}
                    </Text>
                    <View style={styles.cardRow}>

                        <Icon
                            name={props.favorite ? 'heart' : 'heart-o'}
                            type='font-awesome'
                            color='#f50'
                            raised
                            reverse
                            onPress={() => props.favorite ?
                                console.log('Already set as a favorite') : props.markFavorite()}
                        />
                        <Icon
                            name={'pencil'}
                            type='font-awesome'
                            color='#5637DD'
                            raised
                            reverse
                            onPress={() => props.onShowModal()}
                        />
                        <Icon
                            name={'share'}
                            type='font-awesome'
                            color='#5637DD'
                            raised
                            reverse
                            onPress={() => shareCampsite(campsite.name, campsite.description, baseUrl + campsite.image)} 
                        />

                    </View>

                </Card>
            </Animatable.View>

        );
    }
    return <View />
}

function RenderComments({ comments, increment }) {

    const renderCommentItem = ({ item }) => {
        return (
            <Animatable.View animation='fadeInUp' duration={2000} delay={1000}>

                <View style={{ margin: 10 }}>
                    <Text style={{ fontSize: 14 }}>{item.text}</Text>

                    <Rating startingValue={item.rating} imageSize={10} style={{
                        alignItems: "flex - start",
                        paddingVertical: '5%'
                    }}
                        read-only />

                    <Text style={{ fontSize: 12 }}>{`-- ${item.author}, ${item.date}`}</Text>
                    <Text style={{ fontSize: 12 }}></Text>
                    <View style={styles.cardRow}>
                        <Icon
                            name='sort-up'
                            type='font-awesome'
                            color='#71757A'
                            underlayColor='f50'
                            raised
                            reverse
                            onPress={increment}
                        />

                        <Text>{item.upv}</Text>
                    </View>



                </View>
            </Animatable.View>

        );
    };

    return (
        <Card title='Comments'>
            <FlatList
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={item => item.id.toString()}
            />
        </Card>
    );
}

class CampsiteInfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            favorite: false,
            showModal: false,
            rating: 5,
            author: "",
            text: ""
        };
    }

    toggleModal() {
        this.setState({ showModal: !this.state.showModal });
    }
    handleComment(campsiteId) {
        this.props.postComment(campsiteId, this.state.rating, this.state.author, this.state.text)
        //alert(`here is the value ${JSON.stringify(this.state.author)}`)

        this.toggleModal()
    }
    resetForm() {
        this.setState({
            rating: 5,
            author: "",
            text: "",
            showModal: false
        })
    }
    static navigationOptions = {
        title: 'Campsite Information'
    }
    markFavorite(campsiteId) {
        this.props.postFavorite(campsiteId);
    }
    increment = () => {
        this.props.dispatch({ type: 'UPV_COMMENT' });
    }



    render() {

        const campsiteId = this.props.navigation.getParam('campsiteId');
        const campsite = this.props.campsites.campsites.filter(campsite => campsite.id === campsiteId)[0];
        const comments = this.props.comments.comments.filter(comment => comment.campsiteId === campsiteId);
        return (
            <ScrollView>
                <RenderCampsite campsite={campsite}
                    favorite={this.props.favorites.includes(campsiteId)}
                    markFavorite={() => this.markFavorite(campsiteId)}
                    onShowModal={() => this.toggleModal()}
                />
                <RenderComments comments={comments}
                    increment={this.increment}
                />
                <Modal
                    animationType={'slide'}
                    transparent={false}
                    visible={this.state.showModal}
                    onRequestClose={() => this.toggleModal()}
                >
                    <View styles={styles.modal} >
                        <View style={{ margin: 40 }} >
                            <Rating
                                showRating
                                readonly
                                startingValue={this.state.rating}
                                imageSize={40}
                                onFinishRating={rating => this.setState({ rating: rating })}
                                style={{ paddingVertical: 10 }}
                                onFinishRating={rating => this.setState({ rating: rating })}

                            />

                            <Input
                                placeholder='Author'
                                leftIcon={{ type: 'font-awesome', name: 'user-o' }}
                                placeholderTextColor="#000"
                                leftIconContainerStyle={{ paddingRight: 10 }}
                                onChangeText={author => {
                                    this.setState({
                                        author: author
                                    })
                                }}
                                value={this.state.author}
                            />

                            <Input
                                placeholder='Comment'
                                placeholderTextColor="#000"
                                leftIcon={{ type: 'font-awesome', name: 'comment-o' }}
                                leftIconContainerStyle={{ paddingRight: 10 }}
                                onChangeText={text => {
                                    this.setState({
                                        text: text
                                    })
                                }}
                                value={this.state.text}
                            />
                            <Button
                                onPress={() => this.handleComment(campsiteId)}
                                backgroundColor='#5637DD'
                                title="Submit"
                                background="blue"
                            />

                            <Button
                                onPress={() => this.resetForm()}
                                backgroundColor='#007AFF'
                                title="Cancel"
                                background="blue"
                            />

                        </View>
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}
const styles = StyleSheet.create({
    cardRow: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row',
        margin: 20
    }, modal: {
        justifyContent: 'center',
        margin: 20
    }

});




export default connect(mapStateToProps, mapDispatchToProps)(CampsiteInfo);
